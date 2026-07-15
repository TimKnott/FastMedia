// Sync Google Search Console data into seo_* tables.
// Invokable by admin (with auth) or by pg_cron (with service role).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY = 'https://connector-gateway.lovable.dev/google_search_console';

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function weekStart(d: Date) {
  const dt = new Date(d);
  const day = dt.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  dt.setUTCDate(dt.getUTCDate() + diff);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}

async function gscFetch(path: string, init: RequestInit = {}) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const gscKey = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
  if (!lovableKey) throw new Error('LOVABLE_API_KEY missing');
  if (!gscKey) throw new Error('GOOGLE_SEARCH_CONSOLE_API_KEY missing');
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': gscKey,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GSC ${path} [${res.status}]: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

async function queryPerf(siteUrl: string, dimensions: string[], startDate: string, endDate: string, rowLimit = 100) {
  const path = `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const body = { startDate, endDate, dimensions, rowLimit };
  const data = await gscFetch(path, { method: 'POST', body: JSON.stringify(body) });
  return data.rows ?? [];
}

async function syncProperty(supabase: any, prop: { id: string; site_url: string }) {
  const siteUrl = prop.site_url;
  const now = new Date();
  const end = new Date(now); end.setUTCDate(end.getUTCDate() - 3); // GSC lag
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
  const startStr = isoDate(start), endStr = isoDate(end);
  const wk = isoDate(weekStart(end));

  // Performance dimensions
  const dims = ['query', 'page', 'device', 'country', 'date'] as const;
  const dimToKey: Record<string, string> = { query: 'keyword', page: 'page', device: 'device', country: 'country', date: 'daily' };

  for (const d of dims) {
    try {
      const rows = await queryPerf(siteUrl, [d], startStr, endStr, d === 'date' ? 100 : 50);
      await supabase.from('seo_snapshots').upsert({
        property_id: prop.id,
        week_start: wk,
        dimension: dimToKey[d],
        metrics: rows,
      }, { onConflict: 'property_id,week_start,dimension' });
    } catch (e) {
      console.error(`[${siteUrl}] perf ${d} failed:`, (e as Error).message);
    }
  }

  // Sitemaps
  try {
    const sm = await gscFetch(`/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`);
    const sitemaps = sm.sitemap ?? [];
    for (const s of sitemaps) {
      const errors = (s.contents ?? []).reduce((a: number, c: any) => a + (c.indexed ? 0 : 0), 0);
      await supabase.from('seo_sitemaps').upsert({
        property_id: prop.id,
        sitemap_url: s.path,
        last_submitted: s.lastSubmitted ?? null,
        last_downloaded: s.lastDownloaded ?? null,
        is_pending: s.isPending ?? false,
        errors: Number(s.errors ?? 0),
        warnings: Number(s.warnings ?? 0),
        contents: s.contents ?? null,
        checked_at: new Date().toISOString(),
      }, { onConflict: 'property_id,sitemap_url' });

      if (Number(s.errors ?? 0) > 0) {
        await supabase.from('seo_issues').insert({
          property_id: prop.id,
          severity: 'critical',
          category: 'sitemap',
          title: `Sitemap errors: ${s.path}`,
          detail: `Google reports ${s.errors} error(s) in this sitemap.`,
          suggested_fix: 'Open Search Console → Sitemaps to view per-URL errors and fix the offending entries.',
          url: s.path,
        });
      }
    }
  } catch (e) {
    console.error(`[${siteUrl}] sitemaps failed:`, (e as Error).message);
  }

  // Traffic delta detection (week-over-week)
  try {
    const prevEnd = new Date(start); prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
    const prevStart = new Date(prevEnd); prevStart.setUTCDate(prevStart.getUTCDate() - 27);
    const [cur, prev] = await Promise.all([
      queryPerf(siteUrl, [], startStr, endStr, 1),
      queryPerf(siteUrl, [], isoDate(prevStart), isoDate(prevEnd), 1),
    ]);
    const curClicks = cur[0]?.clicks ?? 0;
    const prevClicks = prev[0]?.clicks ?? 0;
    if (prevClicks > 20 && curClicks < prevClicks * 0.75) {
      await supabase.from('seo_issues').insert({
        property_id: prop.id,
        severity: 'warning',
        category: 'traffic',
        title: 'Traffic drop detected',
        detail: `Clicks fell from ${prevClicks} to ${curClicks} (28-day window vs prior 28 days).`,
        suggested_fix: 'Check recent content/template changes, indexing status of top pages, and any algorithm updates this period.',
        metadata: { prev: prevClicks, current: curClicks },
      });
    }
  } catch (e) {
    console.error(`[${siteUrl}] delta failed:`, (e as Error).message);
  }

  await supabase.from('seo_properties').update({ last_synced_at: new Date().toISOString() }).eq('id', prop.id);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let propertyId: string | undefined;
    try { propertyId = (await req.json())?.propertyId; } catch { /* no body */ }

    const q = supabase.from('seo_properties').select('id, site_url').eq('is_active', true);
    const { data: props, error } = propertyId ? await q.eq('id', propertyId) : await q;
    if (error) throw error;

    const results: any[] = [];
    for (const p of props ?? []) {
      try { await syncProperty(supabase, p); results.push({ id: p.id, ok: true }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ synced: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

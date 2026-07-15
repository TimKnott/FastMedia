// Content freshness: parse sitemap lastmod, cross-reference with GSC clicks, recommend refreshes.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const UA = 'FastMediaSEOBot/1.0';

async function fetchText(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    return res.ok ? await res.text() : '';
  } catch { return ''; } finally { clearTimeout(t); }
}

interface SmEntry { loc: string; lastmod?: string }
function parseSitemap(xml: string): SmEntry[] {
  const out: SmEntry[] = [];
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim();
    if (loc) out.push({ loc, lastmod });
  }
  return out;
}

function daysSince(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

async function process(supabase: any, prop: { id: string; site_url: string }) {
  const smUrl = new URL('/sitemap.xml', prop.site_url).toString();
  const xml = await fetchText(smUrl);
  const entries = parseSitemap(xml).slice(0, 200);

  // Build click map from latest GSC snapshot (page dimension)
  const { data: snap } = await supabase.from('seo_snapshots').select('metrics').eq('property_id', prop.id).eq('dimension', 'page').order('week_start', { ascending: false }).limit(1).maybeSingle();
  const clickMap = new Map<string, { clicks: number; impressions: number }>();
  for (const row of snap?.metrics ?? []) {
    const pg = row.keys?.[0];
    if (pg) clickMap.set(pg, { clicks: row.clicks ?? 0, impressions: row.impressions ?? 0 });
  }

  let stale = 0;
  for (const e of entries) {
    const days = daysSince(e.lastmod);
    const stats = clickMap.get(e.loc) ?? { clicks: 0, impressions: 0 };
    let recommendation: string | null = null;
    let trend = 'steady';
    if (days != null && days > 365 && stats.impressions > 100) {
      recommendation = 'High-impression page not updated in over a year. Refresh content, dates, examples and re-publish.';
      trend = 'stale-but-traffic'; stale++;
    } else if (days != null && days > 540) {
      recommendation = 'Very old page. Review for relevance, update or consider retiring.';
      trend = 'very-stale'; stale++;
    } else if (stats.impressions > 200 && stats.clicks < 5) {
      recommendation = 'High impressions, low CTR — rewrite the title and meta description.';
      trend = 'low-ctr';
    }
    await supabase.from('seo_content_freshness').upsert({
      property_id: prop.id, url: e.loc,
      last_modified: e.lastmod ?? null,
      days_since_update: days,
      clicks_28d: stats.clicks,
      impressions_28d: stats.impressions,
      trend, recommendation,
      checked_at: new Date().toISOString(),
    }, { onConflict: 'property_id,url' });
  }

  if (stale > 5) {
    await supabase.from('seo_issues').insert({
      property_id: prop.id, severity: 'info', category: 'content',
      title: `${stale} pages are stale (1+ year old)`,
      suggested_fix: 'Open the Content Freshness tab to prioritise refreshes by impression volume.',
    });
  }

  await supabase.from('seo_properties').update({ last_freshness_at: new Date().toISOString() }).eq('id', prop.id);
  return { processed: entries.length, stale };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let propertyId: string | undefined;
    try { propertyId = (await req.json())?.propertyId; } catch { /**/ }
    const q = supabase.from('seo_properties').select('id, site_url').eq('is_active', true);
    const { data: props, error } = propertyId ? await q.eq('id', propertyId) : await q;
    if (error) throw error;
    const results: any[] = [];
    for (const p of props ?? []) {
      try { results.push({ id: p.id, ok: true, ...(await process(supabase, p)) }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

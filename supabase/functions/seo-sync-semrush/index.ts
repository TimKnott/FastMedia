// Sync Semrush data: backlinks summary, auto-discover competitors, keyword gaps.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY = 'https://connector-gateway.lovable.dev/semrush';

async function semrush(path: string, params: Record<string, string>) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const sem = Deno.env.get('SEMRUSH_API_KEY');
  if (!lovableKey) throw new Error('LOVABLE_API_KEY missing');
  if (!sem) throw new Error('SEMRUSH_API_KEY missing');
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GATEWAY}${path}${qs ? `?${qs}` : ''}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': sem,
      'Allow-Limit-Offset': 'true',
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Semrush ${path} [${res.status}]: ${text.slice(0, 300)}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function rowsToObjects(data: any): any[] {
  const cols = data?.data?.columnNames ?? [];
  const rows = data?.data?.rows ?? [];
  return rows.map((r: any[]) => Object.fromEntries(cols.map((c: string, i: number) => [c, r[i]])));
}

function rootDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

async function syncProperty(supabase: any, prop: { id: string; site_url: string }) {
  const domain = rootDomain(prop.site_url);
  const database = domain.endsWith('.cz') ? 'cz' : domain.endsWith('.uk') || domain.endsWith('.co.uk') ? 'uk' : domain.endsWith('.de') ? 'de' : 'us';

  // 1) Backlinks overview
  try {
    const ov = await semrush('/backlinks/backlinks_overview', { target: domain, target_type: 'root_domain' });
    const rows = rowsToObjects(ov);
    const r = rows[0] ?? {};
    await supabase.from('seo_backlinks').insert({
      property_id: prop.id,
      total_backlinks: Number(r.total ?? r.backlinks_num ?? 0),
      referring_domains: Number(r.domains_num ?? 0),
      authority_score: Number(r.ascore ?? 0),
      follow_ratio: Number(r.follows_num ?? 0) / Math.max(1, Number(r.total ?? r.backlinks_num ?? 1)),
      new_links: Number(r.new ?? 0),
      lost_links: Number(r.lost ?? 0),
    });
    if (Number(r.lost ?? 0) > 20) {
      await supabase.from('seo_issues').insert({
        property_id: prop.id, severity: 'warning', category: 'backlinks',
        title: `Lost ${r.lost} backlinks recently`,
        suggested_fix: 'Reach out to publishers, recover dead anchors, or pursue replacement placements.',
      });
    }
  } catch (e) { console.error('backlinks overview', (e as Error).message); }

  // 2) Top anchors + top referring domains
  try {
    const [anchors, refdomains] = await Promise.all([
      semrush('/backlinks/backlinks_anchors', { target: domain, target_type: 'root_domain', display_limit: '15' }).catch(() => null),
      semrush('/backlinks/backlinks_refdomains', { target: domain, target_type: 'root_domain', display_limit: '15' }).catch(() => null),
    ]);
    const update: any = {};
    if (anchors) update.top_anchors = rowsToObjects(anchors).slice(0, 15);
    if (refdomains) update.top_referring = rowsToObjects(refdomains).slice(0, 15);
    if (Object.keys(update).length) {
      const { data: latest } = await supabase.from('seo_backlinks').select('id').eq('property_id', prop.id).order('snapshot_at', { ascending: false }).limit(1).maybeSingle();
      if (latest) await supabase.from('seo_backlinks').update(update).eq('id', latest.id);
    }
  } catch (e) { console.error('anchors/refdomains', (e as Error).message); }

  // 3) Auto-discover competitors (organic)
  try {
    const comp = await semrush('/domains/domain_organic_organic', { domain, database, display_limit: '5' });
    const competitors = rowsToObjects(comp).map((r: any) => r.Dn || r.domain).filter(Boolean).slice(0, 5);
    for (const c of competitors) {
      await supabase.from('seo_competitors').upsert({
        property_id: prop.id, competitor_domain: c, source: 'semrush_auto', last_synced_at: new Date().toISOString(),
      }, { onConflict: 'property_id,competitor_domain' });
    }
  } catch (e) { console.error('competitors', (e as Error).message); }

  // 4) Keyword gaps (top keywords competitor ranks for that we don't)
  try {
    const { data: comps } = await supabase.from('seo_competitors').select('competitor_domain').eq('property_id', prop.id).eq('is_active', true).limit(3);
    for (const c of comps ?? []) {
      try {
        const kw = await semrush('/domains/domain_organic', { domain: c.competitor_domain, database, display_limit: '20' });
        const krows = rowsToObjects(kw);
        for (const k of krows) {
          await supabase.from('seo_keyword_gaps').insert({
            property_id: prop.id,
            keyword: k.Ph || k.keyword || '',
            competitor_domain: c.competitor_domain,
            competitor_position: Number(k.Po ?? 0) || null,
            volume: Number(k.Nq ?? 0) || null,
            cpc: Number(k.Cp ?? 0) || null,
          });
        }
      } catch (e) { console.error(`gaps ${c.competitor_domain}`, (e as Error).message); }
    }
  } catch (e) { console.error('keyword gaps', (e as Error).message); }

  await supabase.from('seo_properties').update({ last_backlinks_at: new Date().toISOString() }).eq('id', prop.id);
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
      try { await syncProperty(supabase, p); results.push({ id: p.id, ok: true }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ synced: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

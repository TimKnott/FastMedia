// Run PageSpeed Insights on monitored URLs. Free PSI API (no key required for low volume).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function runPsi(url: string, strategy: 'mobile' | 'desktop') {
  const apiKey = Deno.env.get('PAGESPEED_API_KEY');
  const u = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  u.searchParams.set('url', url);
  u.searchParams.set('strategy', strategy);
  ['performance', 'accessibility', 'best-practices', 'seo'].forEach(c => u.searchParams.append('category', c));
  if (apiKey) u.searchParams.set('key', apiKey);
  const res = await fetch(u.toString());
  const text = await res.text();
  if (!res.ok) throw new Error(`PSI ${strategy} [${res.status}]: ${text.slice(0, 250)}`);
  return JSON.parse(text);
}

function pct(v: any) { return v == null ? null : Math.round(v * 100); }

async function auditProperty(supabase: any, prop: { id: string; site_url: string; pagespeed_urls: string[] }) {
  const urls = (prop.pagespeed_urls?.length ? prop.pagespeed_urls : [prop.site_url]).slice(0, 5);
  for (const url of urls) {
    for (const strategy of ['mobile', 'desktop'] as const) {
      try {
        const data = await runPsi(url, strategy);
        const lh = data.lighthouseResult ?? {};
        const cats = lh.categories ?? {};
        const audits = lh.audits ?? {};
        const perf = pct(cats.performance?.score);
        const lcp = Math.round(audits['largest-contentful-paint']?.numericValue ?? 0);
        const cls = Number((audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3));
        const inp = Math.round(audits['interaction-to-next-paint']?.numericValue ?? audits['experimental-interaction-to-next-paint']?.numericValue ?? 0);
        const fcp = Math.round(audits['first-contentful-paint']?.numericValue ?? 0);
        const ttfb = Math.round(audits['server-response-time']?.numericValue ?? 0);
        await supabase.from('seo_pagespeed').insert({
          property_id: prop.id, url, strategy,
          performance: perf,
          accessibility: pct(cats.accessibility?.score),
          best_practices: pct(cats['best-practices']?.score),
          seo: pct(cats.seo?.score),
          lcp_ms: lcp, cls, inp_ms: inp, fcp_ms: fcp, ttfb_ms: ttfb,
        });
        if (perf != null && perf < 50) {
          await supabase.from('seo_issues').insert({
            property_id: prop.id, severity: 'critical', category: 'performance',
            title: `Poor ${strategy} performance: ${perf}/100`,
            url, detail: `LCP ${lcp}ms, CLS ${cls}, INP ${inp}ms`,
            suggested_fix: 'Optimise hero image (WebP/AVIF), defer non-critical JS, audit third-party scripts, enable text compression.',
          });
        } else if (lcp > 2500) {
          await supabase.from('seo_issues').insert({
            property_id: prop.id, severity: 'warning', category: 'core-web-vitals',
            title: `Slow LCP on ${strategy}: ${lcp}ms`, url,
            suggested_fix: 'Preload the hero image, reduce server response time, eliminate render-blocking resources.',
          });
        }
      } catch (e) {
        console.error(`PSI ${url} ${strategy}:`, (e as Error).message);
      }
    }
  }
  await supabase.from('seo_properties').update({ last_pagespeed_at: new Date().toISOString() }).eq('id', prop.id);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let propertyId: string | undefined;
    try { propertyId = (await req.json())?.propertyId; } catch { /**/ }
    const q = supabase.from('seo_properties').select('id, site_url, pagespeed_urls').eq('is_active', true);
    const { data: props, error } = propertyId ? await q.eq('id', propertyId) : await q;
    if (error) throw error;
    const results: any[] = [];
    for (const p of props ?? []) {
      try { await auditProperty(supabase, p as any); results.push({ id: p.id, ok: true }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ audited: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

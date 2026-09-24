// Recurring search-visibility agent (weekly cron, or on demand by an admin).
// 1) Notifies Bing/Yandex/Seznam etc. via IndexNow of all sitemap + published language URLs.
// 2) Resubmits sitemaps to Google Search Console (if a verified property covers the site).
// 3) Checks key pages respond 200 and are not noindex.
// 4) Stores a report in geo_audit_runs.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const HOST = 'www.fastmedia.pro';
const BASE = `https://${HOST}`;
const INDEXNOW_KEY = '2105d77fd4efd018e519384bda4276fe';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const LANG_SITEMAP = `${SUPABASE_URL}/functions/v1/language-sitemap`;
const sb = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

async function sitemapUrls(): Promise<string[]> {
  const out: string[] = [];
  for (const u of [`${BASE}/sitemap.xml`, LANG_SITEMAP]) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const xml = await r.text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) out.push(m[1].replace(/&amp;/g, '&'));
    } catch { /* skip */ }
  }
  return [...new Set(out)].filter((u) => u.startsWith(BASE));
}

async function indexNow(urls: string[]) {
  const results: Record<string, number> = {};
  for (let i = 0; i < urls.length; i += 1000) {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(i, i + 1000) }),
    });
    results[`batch_${i / 1000}`] = r.status;
    await r.text();
  }
  return results;
}

async function googleSitemaps() {
  const lk = Deno.env.get('LOVABLE_API_KEY');
  const ck = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
  if (!lk || !ck) return { status: 'not_connected' };
  const gw = 'https://connector-gateway.lovable.dev/google_search_console';
  const headers = { Authorization: `Bearer ${lk}`, 'X-Connection-Api-Key': ck };
  const r = await fetch(`${gw}/webmasters/v3/sites`, { headers });
  if (!r.ok) return { status: 'error', code: r.status, body: (await r.text()).slice(0, 200) };
  const { siteEntry = [] } = await r.json();
  const verified = (siteEntry as { siteUrl: string; permissionLevel?: string }[]).filter((s) => s.permissionLevel !== 'siteUnverifiedUser');
  const match = verified.find((s) => s.siteUrl === `${BASE}/`) ??
    verified.find((s) => s.siteUrl === 'sc-domain:fastmedia.pro') ??
    verified.find((s) => { try { return `${BASE}/`.startsWith(new URL(s.siteUrl).href); } catch { return false; } });
  if (!match) return { status: 'no_verified_property', properties: verified.map((v) => v.siteUrl) };
  const submitted: Record<string, number> = {};
  for (const sm of [`${BASE}/sitemap.xml`]) {
    const p = await fetch(`${gw}/webmasters/v3/sites/${encodeURIComponent(match.siteUrl)}/sitemaps/${encodeURIComponent(sm)}`, { method: 'PUT', headers });
    submitted[sm] = p.status;
    await p.text();
    if (p.status === 403 || p.status === 429) break;
  }
  return { status: 'ok', property: match.siteUrl, submitted };
}

async function healthCheck(urls: string[]) {
  const key = ['/', '/eu-creative-grant', '/grant-business-plan', '/eu-language-websites', '/courses', '/contact', '/case-studies'].map((p) => BASE + p);
  const sample = [...new Set([...key, ...urls.filter((u) => u.includes('/l/')).slice(0, 20)])];
  const issues: { url: string; problem: string }[] = [];
  for (const u of sample) {
    try {
      const r = await fetch(u, { redirect: 'manual', headers: { 'User-Agent': 'FastMediaVisibilityAgent/1.0' } });
      const html = await r.text();
      if (r.status !== 200) issues.push({ url: u, problem: `HTTP ${r.status}` });
      else if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) issues.push({ url: u, problem: 'noindex' });
    } catch (e) { issues.push({ url: u, problem: String(e).slice(0, 100) }); }
  }
  return { checked: sample.length, issues };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  let body: { urls?: string[] } = {};
  try { body = await req.json(); } catch { /* empty */ }

  // Targeted ping (e.g. right after publishing a language version)
  if (Array.isArray(body.urls) && body.urls.length) {
    const urls = body.urls.filter((u) => typeof u === 'string' && u.startsWith(BASE)).slice(0, 1000);
    return json({ indexnow: await indexNow(urls), count: urls.length });
  }

  const urls = await sitemapUrls();
  const [indexnow, google, health] = [await indexNow(urls), await googleSitemaps(), await healthCheck(urls)];
  const report = { ran_at: new Date().toISOString(), urls_notified: urls.length, indexnow, google, health };
  await sb.from('geo_audit_runs').insert({ status: 'visibility_agent', summary: report } as never).then(() => {}, () => {});
  return json(report);
});

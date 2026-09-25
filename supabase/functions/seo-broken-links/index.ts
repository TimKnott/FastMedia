// Crawl site sitemap, fetch each page, extract internal+outbound links, HEAD-check each unique link.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const UA = 'FastMediaSEOBot/1.0 (+https://www.fastmedia.pro)';
const MAX_PAGES = 25;
const MAX_LINKS = 200;

async function fetchText(url: string, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal, redirect: 'follow' });
    return { ok: res.ok, status: res.status, text: res.ok ? await res.text() : '' };
  } finally { clearTimeout(t); }
}

async function checkLink(url: string) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(t);
    if (res.status >= 400) {
      // retry as GET (some servers reject HEAD)
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), 7000);
      const res2 = await fetch(url, { method: 'GET', headers: { 'User-Agent': UA }, signal: ctrl2.signal, redirect: 'follow' });
      clearTimeout(t2);
      return { status: res2.status, ok: res2.ok };
    }
    return { status: res.status, ok: res.ok };
  } catch (e) { return { status: 0, ok: false, error: (e as Error).message }; }
}

function extractLinks(html: string, base: string): string[] {
  const out: string[] = [];
  const re = /<a\s+[^>]*href\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 500) {
    const href = m[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    try { out.push(new URL(href, base).toString().split('#')[0]); } catch { /**/ }
  }
  return out;
}

async function parseSitemap(siteUrl: string): Promise<string[]> {
  const u = new URL('/sitemap.xml', siteUrl).toString();
  const { ok, text } = await fetchText(u);
  if (!ok) return [siteUrl];
  const re = /<loc>([^<]+)<\/loc>/g;
  const out: string[] = []; let m;
  while ((m = re.exec(text)) && out.length < MAX_PAGES) out.push(m[1].trim());
  return out.length ? out : [siteUrl];
}

async function scanProperty(supabase: any, prop: { id: string; site_url: string }) {
  const pages = await parseSitemap(prop.site_url);
  const origin = new URL(prop.site_url).origin;
  const allLinks = new Map<string, string>(); // target -> first source
  for (const page of pages.slice(0, MAX_PAGES)) {
    try {
      const r = await fetchText(page);
      if (!r.ok) continue;
      const links = extractLinks(r.text, page);
      for (const l of links) if (!allLinks.has(l) && allLinks.size < MAX_LINKS) allLinks.set(l, page);
    } catch { /**/ }
  }

  const now = new Date().toISOString();
  let broken = 0;
  for (const [target, source] of allLinks) {
    const check = await checkLink(target);
    if (check.ok) {
      // Mark previously-broken as resolved
      await supabase.from('seo_broken_links').update({ resolved_at: now, last_seen: now }).match({ property_id: prop.id, target_url: target }).is('resolved_at', null);
      continue;
    }
    broken++;
    const isInternal = target.startsWith(origin);
    await supabase.from('seo_broken_links').upsert({
      property_id: prop.id, source_url: source, target_url: target,
      status_code: check.status, error: (check as any).error ?? null, last_seen: now,
    }, { onConflict: 'property_id,source_url,target_url' } as any).then(async (r: any) => {
      if (r.error) {
        // upsert may fail without unique constraint — fall back to insert
        await supabase.from('seo_broken_links').insert({
          property_id: prop.id, source_url: source, target_url: target,
          status_code: check.status, error: (check as any).error ?? null,
        });
      }
    });
    if (isInternal) {
      await supabase.from('seo_issues').insert({
        property_id: prop.id, severity: 'warning', category: 'broken-link',
        title: `Broken internal link: ${target.replace(origin, '')}`,
        detail: `Linked from ${source}. Status: ${check.status}`,
        url: source,
        suggested_fix: 'Update the anchor href, add a 301 redirect, or remove the link.',
      });
    }
  }

  await supabase.from('seo_properties').update({ last_brokenlinks_at: now }).eq('id', prop.id);
  return { pages: pages.length, links: allLinks.size, broken };
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
      try { results.push({ id: p.id, ok: true, ...(await scanProperty(supabase, p)) }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ scanned: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

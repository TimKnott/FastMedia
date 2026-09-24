// Public XML sitemap of published language versions, with hreflang alternates.
import { createClient } from 'npm:@supabase/supabase-js@2';

const BASE = 'https://www.fastmedia.pro';
const sb = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

Deno.serve(async () => {
  const { data } = await sb
    .from('language_versions')
    .select('language_code, slug, source_path, published_at, updated_at')
    .eq('status', 'published');
  const rows = data ?? [];
  const bySource = new Map<string, typeof rows>();
  for (const r of rows) bySource.set(r.source_path, [...(bySource.get(r.source_path) ?? []), r]);

  const urls = rows.map((r) => {
    const siblings = bySource.get(r.source_path) ?? [];
    const alts = [
      `    <xhtml:link rel="alternate" hreflang="en-GB" href="${esc(BASE + r.source_path)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(BASE + r.source_path)}"/>`,
      ...siblings.map((s) => `    <xhtml:link rel="alternate" hreflang="${s.language_code}" href="${esc(`${BASE}/l/${s.language_code}/${s.slug}`)}"/>`),
    ];
    const lastmod = (r.published_at ?? r.updated_at ?? '').slice(0, 10);
    return [`  <url>`, `    <loc>${esc(`${BASE}/l/${r.language_code}/${r.slug}`)}</loc>`, lastmod ? `    <lastmod>${lastmod}</lastmod>` : '', ...alts, `  </url>`].filter(Boolean).join('\n');
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
});

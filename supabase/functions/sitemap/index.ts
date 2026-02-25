import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://fastmedia-pro.lovable.app';

const indexablePages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/blog', changefreq: 'daily', priority: '0.8' },
  { path: '/calculator', changefreq: 'monthly', priority: '0.7' },
  { path: '/consultant/jitka', changefreq: 'monthly', priority: '0.6' },
  // Demos
  ...[
    'plumbing','electrical','building','roofing','drywall','wells','heating',
    'solar','heatpumps','painting','interior','exterior','gardening','cleaning',
    'locksmith','carpentry','autorepair','pestcontrol','photography','catering',
    'fitness','beautysalon','moving','itservices'
  ].map(t => ({ path: `/demo/${t}`, changefreq: 'monthly' as const, priority: '0.6' })),
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const today = new Date().toISOString().split('T')[0];

  const urls = indexablePages.map(p => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

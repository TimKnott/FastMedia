// Validates structured-data (JSON-LD) on blog/vlog posts. Records FAQ/HowTo/Article presence
// and surfaces issues into seo_issues. Runs weekly.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_ORIGIN = 'https://fastmedia.pro';

interface SchemaResult {
  url: string;
  schemas: string[];
  errors: string[];
  warnings: string[];
  recommendation: string;
}

function extractJsonLd(html: string): any[] {
  const out: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) out.push(...parsed); else out.push(parsed);
    } catch { /* malformed JSON-LD */ out.push({ __parseError: true }); }
  }
  return out;
}

function analyzePage(url: string, html: string, isBlogPost: boolean): SchemaResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const blocks = extractJsonLd(html);
  const types = new Set<string>();
  for (const b of blocks) {
    if (b.__parseError) { errors.push('Malformed JSON-LD block (invalid JSON)'); continue; }
    const t = b['@type'];
    if (Array.isArray(t)) t.forEach(x => types.add(String(x)));
    else if (t) types.add(String(t));
    // Inspect graph
    if (Array.isArray(b['@graph'])) for (const n of b['@graph']) {
      const nt = n?.['@type']; if (Array.isArray(nt)) nt.forEach((x: string) => types.add(x)); else if (nt) types.add(String(nt));
    }
  }
  const schemas = Array.from(types);

  if (blocks.length === 0) {
    errors.push('No JSON-LD structured data found on page');
  }
  if (isBlogPost) {
    if (!schemas.some(s => /Article|BlogPosting|NewsArticle/i.test(s))) {
      errors.push('Blog post is missing Article / BlogPosting schema');
    }
    const hasQA = /FAQ|HowTo|Question/i.test(html);
    if (hasQA && !schemas.some(s => /FAQPage|HowTo/i.test(s))) {
      warnings.push('Page appears to contain Q&A or step-by-step content but lacks FAQPage/HowTo schema (missed rich-result opportunity)');
    }
    if (!/<meta[^>]+property=["']og:image/i.test(html)) warnings.push('Missing og:image — social previews will be poor');
  }

  let recommendation = 'Looks good. Keep structured data current.';
  if (errors.length) recommendation = 'Add the missing schemas to qualify for rich results in Google Search.';
  else if (warnings.length) recommendation = 'Add FAQPage or HowTo schema to capture featured snippets and rich results.';

  return { url, schemas, errors, warnings, recommendation };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    const propertyId: string | undefined = body.propertyId;

    let properties: any[] = [];
    if (propertyId) {
      const { data } = await admin.from('seo_properties').select('id, site_url').eq('id', propertyId);
      properties = data ?? [];
    } else {
      const { data } = await admin.from('seo_properties').select('id, site_url').eq('is_active', true);
      properties = data ?? [];
    }

    const summary: any[] = [];
    for (const prop of properties) {
      // Pull blog post slugs
      const { data: posts } = await admin
        .from('blog_posts')
        .select('slug, title, updated_at, status')
        .eq('status', 'published')
        .limit(100);

      const urls = (posts ?? []).map(p => ({ url: `${SITE_ORIGIN}/blog/${p.slug}`, slug: p.slug, isBlog: true }));
      // Also check FAQ-like pages (homepage + contact as common FAQ holders)
      urls.push({ url: `${SITE_ORIGIN}/`, slug: '', isBlog: false });

      let okCount = 0, errCount = 0, warnCount = 0;
      for (const u of urls) {
        try {
          const res = await fetch(u.url, { headers: { 'User-Agent': 'FastMedia-SEO-Bot/1.0' } });
          if (!res.ok) continue;
          const html = await res.text();
          const result = analyzePage(u.url, html, u.isBlog);

          await admin.from('seo_schema_audits').insert({
            property_id: prop.id,
            url: u.url,
            page_type: u.isBlog ? 'blog' : 'page',
            is_blog: u.isBlog,
            schemas_found: result.schemas,
            errors: result.errors,
            warnings: result.warnings,
            recommendation: result.recommendation,
          });

          if (result.errors.length) {
            errCount++;
            await admin.from('seo_issues').insert({
              property_id: prop.id,
              severity: 'warning',
              category: 'structured-data',
              title: `Schema issues on ${u.url.replace(SITE_ORIGIN, '')}`,
              detail: result.errors.join('; '),
              suggested_fix: result.recommendation,
              url: u.url,
              status: 'open',
            });
          } else if (result.warnings.length) {
            warnCount++;
          } else okCount++;
        } catch (e) {
          console.error('Schema check failed for', u.url, e);
        }
      }
      summary.push({ property_id: prop.id, urls_checked: urls.length, ok: okCount, warnings: warnCount, errors: errCount });
    }

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});

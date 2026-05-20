// E-A-T audit: scan the homepage of each property for Expertise/Authority/Trust signals.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalResult { pass: boolean; score: number; detail: string; }

function check(pass: boolean, weight: number, detail: string): SignalResult {
  return { pass, score: pass ? weight : 0, detail };
}

async function fetchHtml(url: string): Promise<{ html: string; status: number; headers: Headers }> {
  const res = await fetch(url, { headers: { 'User-Agent': 'FastMedia-SEO-Audit/1.0' }, redirect: 'follow' });
  return { html: await res.text(), status: res.status, headers: res.headers };
}

async function auditProperty(supabase: any, prop: { id: string; site_url: string }) {
  const url = prop.site_url.endsWith('/') ? prop.site_url : prop.site_url + '/';
  const isHttps = url.startsWith('https://');
  const signals: Record<string, SignalResult> = {};
  const issues: any[] = [];

  let html = '';
  try {
    const r = await fetchHtml(url);
    html = r.html;
    signals.https = check(isHttps, 10, isHttps ? 'Site uses HTTPS.' : 'Site is not on HTTPS — critical trust signal missing.');
    if (!isHttps) issues.push({ severity: 'critical', category: 'trust', title: 'Site not on HTTPS', suggested_fix: 'Enable HTTPS with a valid certificate. HTTP-only sites are penalised by Google and browsers.' });
  } catch (e) {
    signals.https = check(false, 10, `Unable to fetch ${url}: ${(e as Error).message}`);
  }

  // JSON-LD
  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  let hasOrg = false, hasAuthor = false, hasArticle = false;
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of arr) {
        const types = ([] as string[]).concat(node?.['@type'] ?? []);
        if (types.some((t) => /Organization|LocalBusiness/.test(t))) hasOrg = true;
        if (types.some((t) => /Person/.test(t))) hasAuthor = true;
        if (types.some((t) => /Article|BlogPosting/.test(t))) hasArticle = true;
      }
    } catch { /* ignore */ }
  }
  signals.org_schema = check(hasOrg, 15, hasOrg ? 'Organization/LocalBusiness schema present.' : 'No Organization schema found in homepage JSON-LD.');
  if (!hasOrg) issues.push({ severity: 'warning', category: 'expertise', title: 'Missing Organization schema', suggested_fix: 'Add JSON-LD Organization markup to the homepage with name, logo, url, contactPoint, and sameAs links.' });

  // Contact / privacy
  const hasContact = /\/contact|mailto:|tel:/i.test(html);
  const hasPrivacy = /privacy[-_ ]?(policy|notice)|gdpr/i.test(html);
  const hasTerms = /terms[-_ ]?(of[-_ ]?service|conditions|use)/i.test(html);
  signals.contact = check(hasContact, 10, hasContact ? 'Contact info present.' : 'No contact link, mailto:, or tel: found on homepage.');
  signals.privacy = check(hasPrivacy, 10, hasPrivacy ? 'Privacy policy link found.' : 'No privacy policy link visible on homepage.');
  signals.terms = check(hasTerms, 5, hasTerms ? 'Terms link found.' : 'No terms/conditions link visible on homepage.');
  if (!hasContact) issues.push({ severity: 'warning', category: 'trust', title: 'No contact information on homepage', suggested_fix: 'Add a visible Contact link, phone number, or email address.' });
  if (!hasPrivacy) issues.push({ severity: 'warning', category: 'trust', title: 'No privacy policy link', suggested_fix: 'Add a footer link to your privacy policy. Required for GDPR/CCPA compliance.' });

  // Social profiles (sameAs proxy)
  const social = /(facebook|twitter|linkedin|instagram|youtube|x\.com)\.com\//i.test(html);
  signals.social = check(social, 5, social ? 'Social profile links detected.' : 'No social profile links found.');

  // Author bylines on blog
  try {
    const { count: blogCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published');
    const { count: withAuthor } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published').not('author', 'is', null);
    const ratio = blogCount ? (withAuthor ?? 0) / blogCount : 1;
    const pts = Math.round(ratio * 15);
    signals.blog_authors = { pass: ratio >= 0.8, score: pts, detail: `${withAuthor ?? 0} of ${blogCount ?? 0} published posts have an author byline.` };
    if (ratio < 0.5 && (blogCount ?? 0) > 3) {
      issues.push({ severity: 'warning', category: 'expertise', title: 'Many blog posts missing author bylines', suggested_fix: 'Add author names (and ideally credentials) to every blog post. Author bylines are a key E-E-A-T signal.' });
    }
  } catch {
    signals.blog_authors = check(false, 0, 'Could not query blog posts.');
  }

  // Backlinks (Semrush) — optional
  const semKey = Deno.env.get('SEMRUSH_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (semKey && lovableKey) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      const res = await fetch(`https://connector-gateway.lovable.dev/semrush/backlinks_overview?target=${host}&target_type=root_domain`, {
        headers: { Authorization: `Bearer ${lovableKey}`, 'X-Connection-Api-Key': semKey },
      });
      if (res.ok) {
        const data = await res.json();
        const refDomains = Number(data?.referring_domains ?? data?.ref_domains ?? 0);
        const auth = Number(data?.ascore ?? data?.authority_score ?? 0);
        const pts = Math.min(30, Math.round(auth * 0.3) + Math.min(10, Math.log10(refDomains + 1) * 5));
        signals.backlinks = { pass: auth >= 30, score: pts, detail: `Authority Score ${auth}, ${refDomains} referring domains.` };
        if (auth < 20) issues.push({ severity: 'info', category: 'authority', title: 'Low domain authority', suggested_fix: 'Earn links from reputable industry sites: guest posts, directory listings, partner pages, press mentions.' });
      } else {
        signals.backlinks = check(false, 0, `Semrush returned ${res.status}.`);
      }
    } catch (e) {
      signals.backlinks = check(false, 0, `Semrush call failed: ${(e as Error).message}`);
    }
  } else {
    signals.backlinks = { pass: false, score: 0, detail: 'Semrush connector not linked — backlink analysis skipped.' };
  }

  const expertise_score = Math.min(100, Math.round(((signals.org_schema.score + signals.blog_authors.score) / 30) * 100));
  const authority_score = Math.min(100, Math.round(((signals.backlinks.score + signals.social.score) / 35) * 100));
  const trust_score = Math.min(100, Math.round(((signals.https.score + signals.contact.score + signals.privacy.score + signals.terms.score) / 35) * 100));
  const overall = Math.round((expertise_score + authority_score + trust_score) / 3);

  await supabase.from('eat_audits').insert({
    property_id: prop.id,
    overall_score: overall,
    expertise_score,
    authority_score,
    trust_score,
    signals,
  });

  for (const i of issues) {
    await supabase.from('seo_issues').insert({ ...i, property_id: prop.id });
  }

  await supabase.from('seo_properties').update({ last_eat_audit_at: new Date().toISOString() }).eq('id', prop.id);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let propertyId: string | undefined;
    try { propertyId = (await req.json())?.propertyId; } catch { /* */ }

    const q = supabase.from('seo_properties').select('id, site_url').eq('is_active', true);
    const { data: props, error } = propertyId ? await q.eq('id', propertyId) : await q;
    if (error) throw error;

    const results: any[] = [];
    for (const p of props ?? []) {
      try { await auditProperty(supabase, p); results.push({ id: p.id, ok: true }); }
      catch (e) { results.push({ id: p.id, ok: false, error: (e as Error).message }); }
    }
    return new Response(JSON.stringify({ audited: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

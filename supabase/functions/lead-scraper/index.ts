// Multi-site lead scraper: searches the public web for businesses matching a
// site's lead brief + an industry/location/radius. Saves results for review.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';
import { generateJson } from '../_shared/ai-json.ts';
import { feedbackGuidance, domainOf } from '../_shared/lead-feedback.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
const S = { type: 'string' };
const schema = {
  type: 'object', additionalProperties: false, required: ['leads'],
  properties: { leads: { type: 'array', items: {
    type: 'object', additionalProperties: false,
    required: ['name', 'category', 'website', 'email', 'phone', 'address', 'distance_note', 'why_fit', 'source_url'],
    properties: { name: S, category: S, website: S, email: S, phone: S, address: S, distance_note: S, why_fit: S, source_url: S },
  } } },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(cors);
  try {
    const b = await req.json();
    const str = (v: unknown, m: number) => (typeof v === 'string' ? v.trim().slice(0, m) : '');
    const siteId = str(b.site_id, 60);
    const industry = str(b.industry, 160);
    const extra = str(b.extra, 300);
    const count = Math.min(Math.max(Number(b.count) || 10, 3), 100);
    const radius = Math.min(Math.max(Number(b.radius_km) || 30, 1), 500);
    if (!siteId || !industry) return json({ ok: false, error: 'Choose a website and enter an industry.' }, 400);

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: site } = await db.from('business_sites').select('*').eq('id', siteId).maybeSingle();
    if (!site) return json({ ok: false, error: 'Website not found.' }, 404);
    const location = str(b.location, 120) || site.default_location || 'Česká republika';

    const { data: existing } = await db.from('scraped_leads').select('name,website').eq('site_id', siteId).limit(1000);
    const seen = new Set((existing ?? []).flatMap((l) => [l.name?.toLowerCase(), l.website?.toLowerCase()]).filter(Boolean));

    const fb = await feedbackGuidance(db, siteId);
    const res = await generateJson<{ leads: Record<string, string>[] }>(
      `Search the web (Czech and English sources: Google Maps listings, Firmy.cz, Mapy.cz, company websites, Facebook pages, directories) and find up to ${count} REAL businesses or organisations.
Industry / search term (may be Czech or English): ${industry}
Area: within about ${radius} km of ${location}.
Extra notes: ${extra || 'none'}
Only include entries you actually found on a public page. Use only publicly listed business contact details. Leave a field as an empty string if unknown — never guess emails or phone numbers. distance_note: town and rough distance from ${location}. why_fit: one short English sentence. source_url: the page you found it on.` + fb.text,
      {
        instructions: `You are a lead researcher for "${site.name}" (${site.url || 'no site yet'}): ${site.description}\nLead brief: ${site.lead_brief}`,
        schema, schemaName: 'leads', effort: 'low', webSearch: true,
      },
    );

    const fresh = (res.leads ?? []).filter((l) => l.name && !fb.blockedTitles.has(l.name.toLowerCase()) && !(l.website && fb.blocked.has(domainOf(l.website))) && !seen.has(l.name.toLowerCase()) && !(l.website && seen.has(l.website.toLowerCase())));
    const rows = fresh.map((l) => ({ ...l, site_id: siteId, query: `${industry} · ${location} · ${radius} km` }));
    if (rows.length) await db.from('scraped_leads').insert(rows);
    return json({ ok: true, found: res.leads?.length ?? 0, added: rows.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    console.error('lead-scraper', msg);
    const s = Number(/ai_gateway_failed (\d{3})/.exec(msg)?.[1]) || 500;
    const error = s === 402 ? 'AI credits have run out. Top up in Settings → Plans & credits.'
      : s === 429 ? 'Too many requests — wait a minute and try again.' : 'Search failed. Try again.';
    return json({ ok: false, error }, s);
  }
});

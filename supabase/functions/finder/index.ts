// Multi-site Finder (admin-only, runs only on button press).
// search: AI web search with per-site templates · audit: free homepage health check
// audience_pack: advert targeting plan · export: Google Sheets.
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
const SA = { type: 'array', items: S };
const FIELDS = ['title', 'category', 'country', 'city', 'date_start', 'date_end', 'website', 'email', 'phone', 'address', 'summary', 'source_url'];
const itemsSchema = {
  type: 'object', additionalProperties: false, required: ['items'],
  properties: { items: { type: 'array', items: { type: 'object', additionalProperties: false, required: FIELDS, properties: Object.fromEntries(FIELDS.map((f) => [f, S])) } } },
};
const packSchema = {
  type: 'object', additionalProperties: false,
  required: ['meta_locations', 'meta_radius_km', 'age_min', 'age_max', 'meta_interests', 'ad_angles', 'search_keywords', 'negative_keywords', 'audience_note', 'budget_note'],
  properties: {
    meta_locations: SA, meta_radius_km: { type: 'number' }, age_min: { type: 'number' }, age_max: { type: 'number' },
    meta_interests: SA, ad_angles: SA, search_keywords: SA, negative_keywords: SA, audience_note: S, budget_note: S,
  },
};
const ALLOWED_COUNTRIES = ['Czech Republic', 'Slovakia', 'Austria', 'Germany', 'Poland', 'Hungary'];
const KINDS = ['listing', 'event', 'content', 'bad_site', 'local_place'];
const TABS: Record<string, string> = { listing: 'Listings', event: 'Events', content: 'Content ideas', bad_site: 'Bad websites', local_place: 'Local places' };
const SHEETS = 'https://connector-gateway.lovable.dev/google_sheets/v4';

function brief(kind: string, topic: string, countries: string[], count: number, from: string, to: string, loc: string, radius: number) {
  const where = countries.join(', ');
  if (kind === 'bad_site') return `Find up to ${count} REAL local businesses (${topic || 'trades and local services'}) within about ${radius} km of ${loc}, Czech Republic, that most likely need a new website: no website at all, only a Facebook page or a Firmy.cz/Mapy.cz listing, or an old-looking site.
Search Firmy.cz, Mapy.cz, Google Maps listings, Facebook pages. website = their own site URL (empty if they have none — do NOT put the Facebook/Firmy URL there). summary = one English sentence on what you saw (e.g. "Only a Facebook page, 40 reviews"). Leave date fields empty.`;
  if (kind === 'local_place') return `Find up to ${count} REAL public places and organisations where horse owners gather, within about ${radius} km of ${loc}, Czech Republic: ${topic || 'stables, livery yards (ustájení), riding schools, pony and riding clubs, farriers, equine vets, public local horse Facebook groups/pages, local horse shows and events'}.
Only organisations, businesses, public groups and events — NEVER private individuals. category = one of Stable, Riding school, Club, Farrier, Vet, Facebook group, Event, Other. summary = one English sentence on why they fit a barley-fodder supplier (e.g. number of horses, size). Event dates as YYYY-MM-DD in date_start/date_end.`;
  if (kind === 'event') return `Find up to ${count} REAL upcoming equestrian events (shows, show jumping, dressage, eventing, endurance, western, horse fairs, auctions, clinics, pony club days, breed shows) in: ${where}.
Topic filter: ${topic || 'any equestrian event'}. Date window: ${from || 'from today'} to ${to || 'the next 12 months'}.
Search federation calendars (ČJF jezdectvi.cz, SJF, OEPS, FN, PZJ), FEI calendar, organiser sites, Facebook events.
date_start/date_end as YYYY-MM-DD (empty if unknown). title = event name. category = discipline. summary = one English sentence with level and venue.`;
  if (kind === 'content') return `Find up to ${count} REAL YouTube videos, blog posts or articles that would make good blog posts for a Czech horse & stable directory, about: ${topic || 'horse care, stable management, riding tips'}.
Prefer Czech, Slovak, German or English sources from: ${where}. website = the video/article URL. category = "YouTube", "Blog" or "Article". summary = a suggested Czech blog angle (one sentence) adding our own value — never copy the text. Leave contact fields empty.`;
  return `Find up to ${count} REAL equestrian businesses to add as directory listings: ${topic || 'stables, riding schools, livery yards, farriers, equine vets, saddlers, horse transport, feed suppliers'}.
Countries: ${where}. Search Google Maps, Firmy.cz, Mapy.cz, federation club lists, Facebook pages and business sites. summary = one English sentence on services. Leave date fields empty.`;
}

async function sheets(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SHEETS}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`, 'X-Connection-Api-Key': Deno.env.get('GOOGLE_SHEETS_API_KEY') ?? '' },
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`sheets_failed ${r.status}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : {};
}

async function auditSite(url: string) {
  if (!url) return { score: 90, reasons: ['No website of their own'] };
  const target = /^https?:\/\//i.test(url) ? url : `http://${url}`;
  const reasons: string[] = [];
  let score = 0;
  const t0 = Date.now();
  try {
    const r = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 (FastMedia site check)' } });
    const ms = Date.now() - t0;
    const html = (await r.text()).slice(0, 400000);
    if (!r.ok) { score += 60; reasons.push(`Homepage returns an error (${r.status})`); }
    if (!r.url.startsWith('https://')) { score += 25; reasons.push('Not secure (no https)'); }
    if (!/<meta[^>]+name=["']?viewport/i.test(html)) { score += 25; reasons.push('No mobile version'); }
    const years = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2}|19\d{2})/gi)].map((m) => Number(m[1]));
    const now = new Date().getFullYear();
    if (years.length && Math.max(...years) <= now - 3) { score += 20; reasons.push(`Last updated around ${Math.max(...years)}`); }
    if (!/href=["']tel:/i.test(html)) { score += 10; reasons.push('No tap-to-call button'); }
    if (!/<form/i.test(html)) { score += 5; reasons.push('No contact form'); }
    if (ms > 4000) { score += 15; reasons.push(`Slow to load (${(ms / 1000).toFixed(1)} s)`); }
    if (!reasons.length) reasons.push('Site looks reasonably modern');
    return { score: Math.min(score, 100), reasons, load_ms: ms };
  } catch {
    return { score: 85, reasons: ['Website does not load'] };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(cors);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    const b = await req.json();
    const str = (v: unknown, m: number) => (typeof v === 'string' ? v.trim().slice(0, m) : '');
    const siteId = str(b.site_id, 60);
    const { data: site } = await db.from('business_sites').select('*').eq('id', siteId).maybeSingle();
    if (!site) return json({ ok: false, error: 'Website not found.' }, 404);
    const instructions = `You research for "${site.name}" ${site.url || ''}: ${site.description}\n${site.lead_brief}`;
    const loc = str(b.location, 120) || site.default_location || 'Česká republika';
    const radius = Math.min(Math.max(Number(b.radius_km) || site.default_radius_km || 30, 1), 500);

    if (b.action === 'export') {
      const sheetId = /\/d\/([a-zA-Z0-9_-]+)/.exec(site.sheet_url ?? '')?.[1];
      if (!sheetId) return json({ ok: false, error: 'Paste your Google Sheet link first and save it.' }, 400);
      const meta = await sheets(`/spreadsheets/${sheetId}?fields=sheets.properties.title`);
      const have = new Set((meta.sheets ?? []).map((s: { properties: { title: string } }) => s.properties.title));
      const { data: rows } = await db.from('directory_finds').select('*').eq('site_id', siteId).is('exported_at', null).neq('status', 'rejected').neq('kind', 'audience_pack').limit(500);
      const kinds = [...new Set((rows ?? []).map((r) => r.kind))];
      const missing = kinds.map((k) => TABS[k]).filter((t) => t && !have.has(t));
      if (missing.length) await sheets(`/spreadsheets/${sheetId}:batchUpdate`, { method: 'POST', body: JSON.stringify({ requests: missing.map((title) => ({ addSheet: { properties: { title } } })) }) });
      let total = 0;
      for (const kind of kinds) {
        const tab = TABS[kind];
        const list = (rows ?? []).filter((r) => r.kind === kind);
        const existing = await sheets(`/spreadsheets/${sheetId}/values/'${tab}'!A:A`);
        const titles = new Set((existing.values ?? []).flat().map((v: string) => String(v).toLowerCase()));
        const values: string[][] = [];
        if (!titles.size) values.push([...FIELDS, 'score', 'status', 'found_on']);
        for (const r of list) if (!titles.has(r.title.toLowerCase())) values.push([...FIELDS.map((f) => r[f] ?? ''), r.score == null ? '' : String(r.score), r.status, r.created_at.slice(0, 10)]);
        if (values.length) await sheets(`/spreadsheets/${sheetId}/values/'${tab}'!A1:O1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', body: JSON.stringify({ values }) });
        total += list.length;
        await db.from('directory_finds').update({ exported_at: new Date().toISOString() }).in('id', list.map((r) => r.id));
      }
      return json({ ok: true, exported: total });
    }

    if (b.action === 'audit') {
      const { data: rows } = await db.from('directory_finds').select('id,website').eq('site_id', siteId).eq('kind', 'bad_site').is('score', null).limit(20);
      const results = await Promise.all((rows ?? []).map(async (r) => ({ id: r.id, ...(await auditSite(r.website)) })));
      for (const r of results) await db.from('directory_finds').update({ score: r.score, audit: { reasons: r.reasons, load_ms: r.load_ms ?? null } }).eq('id', r.id);
      return json({ ok: true, checked: results.length });
    }

    if (b.action === 'audience_pack') {
      const pack = await generateJson<Record<string, unknown>>(
        `Build an advert targeting plan for Facebook/Instagram and Google/Sklik to reach ${str(b.topic, 200) || 'horse owners and stable managers who could buy fresh barley fodder'} within about ${radius} km of ${loc}, Czech Republic.
Use only targeting options that exist in Meta Ads (locations + radius, age, broad interests such as Horse, Equestrianism, Horse riding, Horse care, Livestock). Never target or list individual people.
search_keywords: 15–25 Czech search phrases buyers would type. negative_keywords: 15–25 Czech words to exclude. ad_angles: 3 short Czech advert angles based only on the site facts given — invent no prices, reviews or discounts.
audience_note: plain English, rough audience size as an ESTIMATE. budget_note: plain English suggested starter daily budget in Kč, labelled as an estimate.`,
        { instructions, schema: packSchema, schemaName: 'pack', effort: 'low' },
      );
      const title = `Targeting pack · ${loc} ${radius} km · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
      await db.from('directory_finds').insert({ site_id: siteId, kind: 'audience_pack', title, audit: pack, query: str(b.topic, 200) });
      return json({ ok: true, added: 1 });
    }

    const kind = KINDS.includes(b.kind) ? b.kind : 'listing';
    const topic = str(b.topic, 200);
    const countries = (Array.isArray(b.countries) ? b.countries : []).filter((c: string) => ALLOWED_COUNTRIES.includes(c));
    if (!countries.length) countries.push('Czech Republic');
    const count = Math.min(Math.max(Number(b.count) || 10, 3), 20);
    const fb = await feedbackGuidance(db, siteId);
    const res = await generateJson<{ items: Record<string, string>[] }>(
      brief(kind, topic, countries, count, str(b.date_from, 10), str(b.date_to, 10), loc, radius) +
        `\nOnly include items you actually found on a public page; source_url must be that page. Use only publicly listed business contact details; leave a field empty rather than guessing. country = country name in English.` + (kind === 'content' ? '' : fb.text),
      { instructions, schema: itemsSchema, schemaName: 'items', effort: 'low', webSearch: true },
    );
    const { data: existing } = await db.from('directory_finds').select('title').eq('site_id', siteId).eq('kind', kind).limit(5000);
    const seen = new Set((existing ?? []).map((r) => r.title.toLowerCase()));
    const rows = (res.items ?? []).filter((i) => {
      const k = i.title?.toLowerCase();
      if (!k || seen.has(k) || fb.blockedTitles.has(k)) return false;
      if (i.website && fb.blocked.has(domainOf(i.website))) return false;
      seen.add(k);
      return true;
    }).map((i) => ({ ...Object.fromEntries(FIELDS.map((f) => [f, String(i[f] ?? '').slice(0, 1000)])), site_id: siteId, kind, query: `${topic || kind} · ${kind === 'bad_site' || kind === 'local_place' ? `${loc} ${radius} km` : countries.join('/')}` }));
    if (rows.length) await db.from('directory_finds').insert(rows);
    return json({ ok: true, found: res.items?.length ?? 0, added: rows.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    console.error('finder', msg);
    const sheet = /sheets_failed (\d{3})/.exec(msg);
    if (sheet) return json({ ok: false, error: sheet[1] === '404' || sheet[1] === '403' ? 'Google Sheet not found or not shared with your connected Google account.' : `Google Sheets error ${sheet[1]}.` }, 502);
    const s = Number(/ai_gateway_failed (\d{3})/.exec(msg)?.[1]) || 500;
    const error = s === 402 ? 'AI credits have run out. Top up in Settings → Plans & credits.'
      : s === 429 ? 'Too many requests — wait a minute and try again.' : 'Search failed. Try again.';
    return json({ ok: false, error }, s);
  }
});

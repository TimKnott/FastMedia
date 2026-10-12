// Directory finder for Cheval et Stable: finds listings, events (CZ + nearby
// countries) and content ideas (YouTube/blogs) with AI web search, and exports
// them to the directory's Google Sheet. Admin-only, runs only on button press.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';
import { generateJson } from '../_shared/ai-json.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
const S = { type: 'string' };
const FIELDS = ['title', 'category', 'country', 'city', 'date_start', 'date_end', 'website', 'email', 'phone', 'address', 'summary', 'source_url'];
const schema = {
  type: 'object', additionalProperties: false, required: ['items'],
  properties: { items: { type: 'array', items: {
    type: 'object', additionalProperties: false, required: FIELDS,
    properties: Object.fromEntries(FIELDS.map((f) => [f, S])),
  } } },
};
const ALLOWED_COUNTRIES = ['Czech Republic', 'Slovakia', 'Austria', 'Germany', 'Poland', 'Hungary'];
const TABS: Record<string, string> = { listing: 'Listings', event: 'Events', content: 'Content ideas' };
const SHEETS = 'https://connector-gateway.lovable.dev/google_sheets/v4';

function brief(kind: string, topic: string, countries: string[], count: number, from: string, to: string) {
  const where = countries.join(', ');
  if (kind === 'event') return `Find up to ${count} REAL upcoming equestrian events (shows, show jumping, dressage, eventing, endurance, western, horse fairs, auctions, clinics, pony club days, hunts, breed shows) in: ${where}.
Topic filter: ${topic || 'any equestrian event'}. Date window: ${from || 'from today'} to ${to || 'the next 12 months'}.
Search national federation calendars (ČJF jezdectvi.cz, SJF, OEPS, FN, PZJ), FEI calendar, organiser sites, Facebook events.
date_start/date_end as YYYY-MM-DD (empty if unknown). title = event name. category = discipline. summary = one English sentence with level and venue.`;
  if (kind === 'content') return `Find up to ${count} REAL YouTube videos, blog posts or articles that would make good blog posts for a Czech horse & stable directory website, about: ${topic || 'horse care, stable management, riding tips'}.
Prefer Czech, Slovak, German or English sources from: ${where}. website = the video/article URL. title = original title. category = "YouTube" or "Blog" or "Article". summary = a suggested Czech blog post angle (one sentence) that adds our own value — never copy the text. Leave contact fields empty.`;
  return `Find up to ${count} REAL equestrian businesses to add as directory listings: ${topic || 'stables, riding schools, livery yards, farriers, equine vets, saddlers, horse transport, feed suppliers'}.
Countries: ${where}. Search Google Maps, Firmy.cz, Mapy.cz, federation club lists, Facebook pages and business sites.
Use only publicly listed business contact details; leave a field empty rather than guessing. summary = one English sentence on services. Leave date fields empty.`;
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

    if (b.action === 'export') {
      const sheetId = /\/d\/([a-zA-Z0-9_-]+)/.exec(site.sheet_url ?? '')?.[1];
      if (!sheetId) return json({ ok: false, error: 'Paste your Google Sheet link first and save it.' }, 400);
      const meta = await sheets(`/spreadsheets/${sheetId}?fields=sheets.properties.title`);
      const have = new Set((meta.sheets ?? []).map((s: { properties: { title: string } }) => s.properties.title));
      const missing = Object.values(TABS).filter((t) => !have.has(t));
      if (missing.length) await sheets(`/spreadsheets/${sheetId}:batchUpdate`, { method: 'POST', body: JSON.stringify({ requests: missing.map((title) => ({ addSheet: { properties: { title } } })) }) });
      const { data: rows } = await db.from('directory_finds').select('*').eq('site_id', siteId).is('exported_at', null).neq('status', 'rejected').limit(500);
      let total = 0;
      for (const [kind, tab] of Object.entries(TABS)) {
        const list = (rows ?? []).filter((r) => r.kind === kind);
        if (!list.length) continue;
        const existing = await sheets(`/spreadsheets/${sheetId}/values/'${tab}'!A:A`);
        const titles = new Set((existing.values ?? []).flat().map((v: string) => String(v).toLowerCase()));
        const values: string[][] = [];
        if (!titles.size) values.push([...FIELDS, 'status', 'found_on']);
        for (const r of list) if (!titles.has(r.title.toLowerCase())) values.push([...FIELDS.map((f) => r[f] ?? ''), r.status, r.created_at.slice(0, 10)]);
        if (values.length) await sheets(`/spreadsheets/${sheetId}/values/'${tab}'!A1:N1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', body: JSON.stringify({ values }) });
        total += list.length;
        await db.from('directory_finds').update({ exported_at: new Date().toISOString() }).in('id', list.map((r) => r.id));
      }
      return json({ ok: true, exported: total });
    }

    const kind = ['listing', 'event', 'content'].includes(b.kind) ? b.kind : 'listing';
    const topic = str(b.topic, 200);
    const countries = (Array.isArray(b.countries) ? b.countries : []).filter((c: string) => ALLOWED_COUNTRIES.includes(c));
    if (!countries.length) countries.push('Czech Republic');
    const count = Math.min(Math.max(Number(b.count) || 10, 3), 20);
    const res = await generateJson<{ items: Record<string, string>[] }>(
      brief(kind, topic, countries, count, str(b.date_from, 10), str(b.date_to, 10)) + `\nOnly include items you actually found on a public page; source_url must be that page. country = country name in English.`,
      { instructions: `You research content for "${site.name}" ${site.url || ''}: ${site.description}\n${site.lead_brief}`, schema, schemaName: 'items', effort: 'low', webSearch: true },
    );
    const { data: existing } = await db.from('directory_finds').select('title').eq('site_id', siteId).eq('kind', kind).limit(5000);
    const seen = new Set((existing ?? []).map((r) => r.title.toLowerCase()));
    const rows = (res.items ?? []).filter((i) => i.title && !seen.has(i.title.toLowerCase()) && !seen.has(i.title.toLowerCase()) && seen.add(i.title.toLowerCase()))
      .map((i) => ({ ...Object.fromEntries(FIELDS.map((f) => [f, String(i[f] ?? '').slice(0, 1000)])), site_id: siteId, kind, query: `${topic || kind} · ${countries.join('/')}` }));
    if (rows.length) await db.from('directory_finds').insert(rows);
    return json({ ok: true, found: res.items?.length ?? 0, added: rows.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    console.error('directory-finder', msg);
    const sheet = /sheets_failed (\d{3})/.exec(msg);
    if (sheet) return json({ ok: false, error: sheet[1] === '404' || sheet[1] === '403' ? 'Google Sheet not found or not shared with your connected Google account.' : `Google Sheets error ${sheet[1]}.` }, 502);
    const s = Number(/ai_gateway_failed (\d{3})/.exec(msg)?.[1]) || 500;
    const error = s === 402 ? 'AI credits have run out. Top up in Settings → Plans & credits.'
      : s === 429 ? 'Too many requests — wait a minute and try again.' : 'Search failed. Try again.';
    return json({ ok: false, error }, s);
  }
});

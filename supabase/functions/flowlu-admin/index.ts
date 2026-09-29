// Admin-gated Flowlu CRM bridge: test connection, push leads/enquiries/calls, show webhook URL.
// Also serves as the scheduled/auto sync endpoint (service role or cron secret).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';
import { generateJson } from '../_shared/ai-json.ts';
import { sendViaGmail } from '../_shared/gmail-fallback.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const sb = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

function account() {
  let a = (Deno.env.get('FLOWLU_ACCOUNT') ?? '').trim().toLowerCase();
  a = a.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.flowlu\.(com|ru|eu)$/, '');
  a = a.split(/\s+/)[0]; // "fastmedia crm" -> "fastmedia"
  return a;
}
const KEY = () => (Deno.env.get('FLOWLU_API_KEY') ?? '').trim();

async function flowlu(path: string, params: Record<string, string> = {}, method: 'GET' | 'POST' = 'GET') {
  const base = `https://${account()}.flowlu.com/api/v1/${path}`;
  const qs = new URLSearchParams({ api_key: KEY() });
  let res!: Response;
  let text = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    if (method === 'GET') {
      for (const [k, v] of Object.entries(params)) qs.set(k, v);
      res = await fetch(`${base}?${qs}`);
    } else {
      res = await fetch(`${base}?${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params),
      });
    }
    text = await res.text();
    if (res.status !== 429 && !/Request limit exceeded/.test(text)) break;
    await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
  }
  let body: any = null;
  try { body = JSON.parse(text); } catch { /* html */ }
  if (!res.ok || body?.error) {
    throw new Error(`Flowlu ${res.status}: ${body?.error?.message ?? (body?.error ? JSON.stringify(body.error).slice(0, 200) : text.slice(0, 160))}`);
  }
  return body?.response ?? body;
}

async function logResult(entity_type: string, entity_id: string, fn: () => Promise<string | null>, payload: unknown) {
  try {
    const fid = await fn();
    await sb.from('flowlu_sync_log').upsert(
      { entity_type, entity_id, direction: 'push', flowlu_id: fid, status: 'synced', error: null, payload, created_at: new Date().toISOString() },
      { onConflict: 'entity_type,entity_id,direction' },
    );
    return { ok: true };
  } catch (e) {
    await sb.from('flowlu_sync_log').upsert(
      { entity_type, entity_id, direction: 'push', status: 'failed', error: String((e as Error).message).slice(0, 500), payload },
      { onConflict: 'entity_type,entity_id,direction' },
    );
    return { ok: false, error: (e as Error).message };
  }
}

// Transparent 0-100 score so the best Flowlu leads stand out.
function scoreLead(l: any): { score: number; priority: string; reasons: string[] } {
  let s = 0; const r: string[] = [];
  if (l.contact_email) { s += 20; r.push('Has email (+20)'); }
  if (l.contact_phone) { s += 10; r.push('Has phone (+10)'); }
  if (l.contact_company || l.customer_id) { s += 10; r.push('Linked company (+10)'); }
  const budget = Number(l.budget) || 0;
  if (budget > 0) { const b = budget >= 50000 ? 20 : budget >= 15000 ? 12 : 6; s += b; r.push(`Budget ${budget} (+${b})`); }
  const blob = JSON.stringify(l);
  const ws = blob.match(/(\d{1,3})\s*\/\s*100/);
  if (ws && Number(ws[1]) <= 100) {
    const w = Number(ws[1]); const p = w < 40 ? 20 : w < 60 ? 12 : 4;
    s += p; r.push(`Website score ${w}/100 — room to improve (+${p})`);
  } else if (/No own website|no website/i.test(blob)) { s += 15; r.push('No own website (+15)'); }
  const created = l.created_date ? Date.parse(String(l.created_date).replace(' ', 'T') + 'Z') : NaN;
  if (!isNaN(created)) {
    const days = (Date.now() - created) / 86400000;
    if (days <= 7) { s += 15; r.push('Added this week (+15)'); } else if (days <= 30) { s += 8; r.push('Added this month (+8)'); }
  }
  if (String(l.active ?? '1') === '1' && !l.closing_date) { s += 5; r.push('Still open (+5)'); }
  s = Math.min(100, s);
  return { score: s, priority: s >= 60 ? 'high' : s >= 35 ? 'medium' : 'low', reasons: r };
}

// All leads are assigned to Tim Knott (Flowlu user 172245, account admin).
const FLOWLU_OWNER_USER_ID = 172245;

async function createOpportunity(p: { name: string; email?: string | null; phone?: string | null; company?: string | null; description: string; source: string }) {
  const r = await flowlu('module/crm/lead/create', {
    name: `${p.source}: ${p.name}`.slice(0, 250),
    contact_name: p.name ?? '',
    contact_email: p.email ?? '',
    contact_phone: p.phone ?? '',
    contact_company: p.company ?? '',
    description: p.description.slice(0, 5000),
    assignee_id: FLOWLU_OWNER_USER_ID,
  }, 'POST');
  return r?.id ? String(r.id) : null;
}

async function auditWebsite(url?: string | null): Promise<string[]> {
  const out: string[] = [];
  if (!url) return ['No website found — only directory listings.'];
  let host = '';
  try { host = new URL(url).hostname; } catch { return ['Website address is invalid.']; }
  if (/firmy\.cz|facebook|instagram|google/.test(host)) out.push(`No own website found — business relies on a third-party listing (${host}).`);
  const root = `https://${host}/`;
  const t0 = Date.now();
  try {
    const res = await fetch(root, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 FastMediaAudit' } });
    const ms = Date.now() - t0;
    const html = await res.text();
    out.push(`Homepage status ${res.status}, loaded in ${ms} ms, ${Math.round(html.length / 1024)} KB HTML.`);
    out.push(res.url.startsWith('https://') ? 'Uses HTTPS.' : 'Does NOT use HTTPS (browsers show "Not secure").');
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
    out.push(title ? `Page title: "${title.slice(0, 90)}"${title.length < 15 ? ' (too short for search)' : ''}.` : 'Missing page title.');
    out.push(/<meta[^>]+name=["']description["']/i.test(html) ? 'Has a meta description.' : 'Missing meta description (weak Google snippet).');
    out.push(/<meta[^>]+name=["']viewport["']/i.test(html) ? 'Has mobile viewport tag.' : 'No mobile viewport tag — likely not mobile-friendly.');
    out.push(/application\/ld\+json/i.test(html) ? 'Has structured data.' : 'No structured data (no LocalBusiness schema for Google Maps/AI search).');
    out.push(/<h1[\s>]/i.test(html) ? 'Has an H1 heading.' : 'No H1 heading.');
    out.push(/reserv|rezerv|booking|objedn/i.test(html) ? 'Mentions booking/ordering.' : 'No online booking found.');
    out.push(/og:image/i.test(html) ? 'Has social share image.' : 'No social share image (og:image).');
    const gen = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1];
    if (gen) out.push(`Built with: ${gen}.`);
    const year = [...html.matchAll(/(?:©|&copy;|copyright)\s*(\d{4})/gi)].map((m) => +m[1]).sort().pop();
    if (year) out.push(`Latest copyright year shown: ${year}${year < new Date().getFullYear() - 1 ? ' (looks outdated)' : ''}.`);
    out.push(/google\.[a-z.]+\/maps|maps\.google|mapy\.cz/i.test(html) ? 'Has an embedded map.' : 'No embedded map.');
    out.push(/gtag\(|googletagmanager|google-analytics/i.test(html) ? 'Has Google Analytics/Tag Manager.' : 'No analytics tracking found (visits are not measured).');
    out.push(/tel:/i.test(html) ? 'Has click-to-call phone link.' : 'No click-to-call phone link.');
    out.push(/facebook\.com|instagram\.com/i.test(html) ? 'Links to social media.' : 'No social media links.');
    out.push(/cookie/i.test(html) ? 'Mentions cookies/consent.' : 'No cookie consent notice found (GDPR risk).');
    out.push(/<html[^>]+lang=/i.test(html) ? 'Declares page language.' : 'No page language declared.');
    const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    const noAlt = imgs.filter((i) => !/\balt=["'][^"']+/i.test(i)).length;
    if (imgs.length) out.push(`${imgs.length} images, ${noAlt} without alt text${noAlt ? ' (accessibility/SEO issue)' : ''}.`);
  } catch (e) {
    out.push(`Homepage could not be loaded: ${(e as Error).message.slice(0, 120)}.`);
  }
  return out;
}

const NEG = /not|no |missing|outdated|too short|could not|risk|without alt text \(/i;
function scoreAudit(audit: string[]): number {
  const checks = audit.filter((a) => !/^Homepage status|^Built with|^Latest copyright/.test(a) || /outdated/.test(a));
  if (!checks.length) return 0;
  const bad = checks.filter((a) => NEG.test(a) && !/^Uses HTTPS/.test(a)).length;
  return Math.max(0, Math.round(100 * (1 - bad / checks.length)));
}

async function buildB2BReport(p: any, audit: string[], score: number): Promise<{ report: string; pitch: string }> {
  const lang = (p.language ?? 'cs').toLowerCase().startsWith('cs') ? 'Czech' : 'British English';
  const out = await generateJson<{ report: string; pitch: string }>(
    `Business: ${p.company}\nContact: ${p.contact_name ?? 'unknown'}\nTrade: ${p.trade}\nTown: ${p.region}\nWebsite: ${p.website ?? 'none'}\nOverall website score: ${score}/100\nObserved automated checks:\n${audit.map((a) => '- ' + a).join('\n')}`,
    {
      schemaName: 'b2b_report',
      schema: { type: 'object', additionalProperties: false, required: ['report', 'pitch'], properties: { report: { type: 'string' }, pitch: { type: 'string' } } },
      instructions: `You are a senior web consultant at FastMedia.Pro (Timothy Knott, Louny, Czech Republic, www.fastmedia.pro, +420 797 864 432).
Write two plain-text items (no markdown tables, use simple headings and dashes).
1) "report": a professional business-to-business website audit in British English for FastMedia's sales team. Sections: EXECUTIVE SUMMARY (score, 2-3 sentences); FINDINGS (each issue: what we observed → why it costs the business customers/bookings/Google visibility → severity High/Medium/Low); WHAT WORKS; RECOMMENDED UPGRADE (concrete deliverables e.g. mobile responsive rebuild, online booking, LocalBusiness schema, Google Business Profile alignment, analytics, GDPR consent); MANUAL CHECKS TO DO (things the salesperson should verify by testing the site on a phone, Google search, PageSpeed Insights, Google Maps listing, reviews); TALKING POINTS.
2) "pitch": a short, polite, non-pushy first email written in ${lang} addressed to the contact, explaining the 3-4 most important problems in plain language and why an upgrade helps them win more customers, offering a free no-obligation consultation. Include a subject line on the first line as "Subject: ...". Sign as Timothy Knott, FastMedia.Pro.
STRICT: only use the observed facts given. Never invent statistics, reviews, rankings, prices, grant amounts or claims about the business. If something is unknown, say it needs checking.`,
    },
  );
  return { report: out.report ?? '', pitch: out.pitch ?? '' };
}

async function alreadySynced(type: string): Promise<Set<string>> {
  const { data } = await sb.from('flowlu_sync_log').select('entity_id').eq('entity_type', type).eq('status', 'synced');
  return new Set((data ?? []).map((r) => r.entity_id));
}

async function syncAll(limit = 25) {
  const out = { leads: 0, enquiries: 0, calls: 0, failed: 0, errors: [] as string[] };
  const { data: settings } = await sb.from('flowlu_settings').select('*').eq('id', 1).maybeSingle();

  if (settings?.auto_sync_leads !== false) {
    const done = await alreadySynced('lead');
    const { data: leads } = await sb.from('leads').select('*').order('created_at', { ascending: false }).limit(200);
    for (const l of (leads ?? []).filter((x) => !done.has(x.id)).slice(0, limit)) {
      const r = await logResult('lead', l.id, () => createOpportunity({
        name: l.name, email: l.email, phone: l.phone, source: 'Calculator lead',
        description: [`Trade: ${l.trade}`, `Score: ${l.score} (${l.classification})`, `Quote: ${l.quote_one_time} one-time / ${l.quote_monthly} monthly`, l.budget_range ? `Budget: ${l.budget_range}` : '', l.special_request ?? ''].filter(Boolean).join('\n'),
      }), { name: l.name });
      r.ok ? out.leads++ : (out.failed++, out.errors.push(r.error!));
    }
    const doneE = await alreadySynced('enquiry');
    const { data: enq } = await sb.from('contact_enquiries').select('*').order('created_at', { ascending: false }).limit(200);
    for (const e of (enq ?? []).filter((x) => !doneE.has(x.id)).slice(0, limit)) {
      const d = e.details ?? {};
      const r = await logResult('enquiry', e.id, () => createOpportunity({
        name: e.name, email: e.email, phone: e.phone, company: e.company, source: `Enquiry (${e.kind})`,
        description: [e.message ?? '', d.region ? `Region: ${d.region}` : '', d.industry ? `Industry: ${d.industry}` : '', d.budget ? `Budget: ${d.budget}` : ''].filter(Boolean).join('\n'),
      }), { name: e.name, kind: e.kind });
      r.ok ? out.enquiries++ : (out.failed++, out.errors.push(r.error!));
    }
  }

  if (settings?.auto_sync_calls !== false) {
    const { data: calls } = await sb.from('voice_calls').select('*').eq('flowlu_synced', false).limit(limit);
    for (const c of calls ?? []) {
      if (!c.ended_at && c.status !== 'completed') continue;
      const phone = c.direction === 'inbound' ? c.from_number : c.to_number;
      const r = await logResult('call', c.id, () => createOpportunity({
        name: `Phone ${phone ?? 'unknown'}`, phone, source: `Voice call (${c.direction})`,
        description: [`Duration: ${c.duration_seconds ?? 0}s`, c.summary ?? '', c.outcome ? `Outcome: ${c.outcome}` : ''].filter(Boolean).join('\n'),
      }), { phone });
      if (r.ok) { out.calls++; await sb.from('voice_calls').update({ flowlu_synced: true }).eq('id', c.id); }
      else { out.failed++; out.errors.push(r.error!); }
    }
  }
  await sb.from('flowlu_settings').update({ last_sync_at: new Date().toISOString() }).eq('id', 1);
  out.errors = [...new Set(out.errors)].slice(0, 5);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);
  if (!account() || !KEY()) return json({ error: 'Flowlu account or API key missing' }, 503);

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? 'sync');
  try {
    if (action === 'test') {
      try {
        const r = await flowlu('module/crm/lead/list', { limit: '1' });
        const total = r?.total ?? r?.count ?? (Array.isArray(r?.items) ? r.items.length : null);
        const msg = `Connected to ${account()}.flowlu.com${total != null ? ` — ${total} opportunities visible` : ''}`;
        await sb.from('flowlu_settings').update({ last_test_at: new Date().toISOString(), last_test_ok: true, last_test_message: msg }).eq('id', 1);
        return json({ ok: true, message: msg });
      } catch (e) {
        const msg = (e as Error).message;
        await sb.from('flowlu_settings').update({ last_test_at: new Date().toISOString(), last_test_ok: false, last_test_message: msg }).eq('id', 1);
        return json({ ok: false, message: msg });
      }
    }
    if (action === 'push_prospect') {
      const id = String(body.prospect_id ?? '');
      const { data: p } = await sb.from('prospects').select('*').eq('id', id).maybeSingle();
      if (!p) return json({ error: 'prospect not found' }, 404);
      const audit = await auditWebsite(p.website);
      const r: any = p.research ?? {};
      const researchLines = Object.entries(r).filter(([, v]) => v && typeof v !== 'object').map(([k, v]) => `${k}: ${v}`);
      const score = scoreAudit(audit);
      const b2b = await buildB2BReport(p, audit, score).catch((e) => ({ report: `AI report failed: ${(e as Error).message}\n\n${audit.map((a) => '- ' + a).join('\n')}`, pitch: '' }));
      const description = [
        `FASTMEDIA LEAD REPORT — ${p.company}`,
        `Contact: ${p.contact_name ?? '-'} | ${p.email ?? '-'} | ${p.phone ?? '-'}`,
        `Trade: ${p.trade ?? '-'} | Area: ${p.region ?? '-'} | Language: ${p.language ?? '-'}`,
        `Website / listing: ${p.website ?? 'none'} | Website score: ${score}/100`,
        `Found via: ${p.discovered_query ?? p.source}`,
        p.notes ? `Notes: ${p.notes}` : '',
        researchLines.length ? '\nRESEARCH:\n' + researchLines.join('\n') : '',
        '', 'Full B2B website audit → field "Website audit report (B2B)". Ready-to-send message → field "Outreach pitch to client".',
        'NEXT STEP: review, then approve a personalised first email on the Prospecting desk. Nothing has been sent to this business yet.',
      ].filter((x) => x !== '').join('\n');

      // Customer (CRM account): find by name or create as a company.
      let customerId: string | null = null;
      try {
        const found = await flowlu('module/crm/account/list', { 'filter[name]': p.company, limit: '1' });
        customerId = found?.items?.[0]?.id ? String(found.items[0].id) : null;
        if (!customerId) {
          const acc = await flowlu('module/crm/account/create', {
            type: '1', name: p.company, email: p.email ?? '', phone: p.phone ?? '', web: p.website ?? '',
            address: p.address ?? p.region ?? '', billing_city: p.region ?? '', billing_country: 'Czech Republic',
            description: `${p.trade ?? ''} — discovered by FastMedia prospecting (${p.discovered_query ?? p.source}).`,
          }, 'POST');
          customerId = acc?.id ? String(acc.id) : null;
        }
      } catch (e) { console.error('account', (e as Error).message); }

      const campaign = `${(p.trade ?? 'lead').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${(p.region ?? '').toString().toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}`.replace(/-+$/, '');
      const fields: Record<string, string> = {
        name: `${p.company} — website upgrade (${p.trade ?? 'lead'}, ${p.region ?? ''})`.slice(0, 250),
        contact_name: p.contact_name ?? '', contact_email: p.email ?? '', contact_phone: p.phone ?? '',
        contact_company: p.company ?? '', contact_web: p.website ?? '', contact_position: p.contact_role ?? 'Owner',
        description: description.slice(0, 5000), source_id: '10',
        ...(customerId ? { customer_id: customerId } : {}),
        cf_25: 'fastmedia-prospecting', cf_26: 'outbound', cf_27: campaign, cf_28: 'website-audit',
        cf_29: (p.discovered_query ?? '').slice(0, 200), cf_30: p.website ?? 'none', cf_31: String(score),
        cf_32: b2b.report.slice(0, 20000), cf_33: b2b.pitch.slice(0, 8000),
      };
      const { data: prev } = await sb.from('flowlu_sync_log').select('flowlu_id').eq('entity_type', 'prospect').eq('entity_id', id).eq('direction', 'push').maybeSingle();
      const res = await logResult('prospect', id, async () => {
        if (prev?.flowlu_id) { await flowlu(`module/crm/lead/update/${prev.flowlu_id}`, fields, 'POST'); return prev.flowlu_id; }
        const c = await flowlu('module/crm/lead/create', fields, 'POST');
        return c?.id ? String(c.id) : null;
      }, { company: p.company });
      const { data: log } = await sb.from('flowlu_sync_log').select('flowlu_id,status,error').eq('entity_type', 'prospect').eq('entity_id', id).maybeSingle();
      return json({ ...res, flowlu_id: log?.flowlu_id, customer_id: customerId, url: log?.flowlu_id ? `https://${account()}.flowlu.com/crm/lead/view/${log.flowlu_id}` : null, score, audit, report: b2b.report, pitch: b2b.pitch });
    }
    if (action === 'pull_leads') {
      const all: any[] = [];
      for (let page = 1; page <= 30; page++) {
        const r = await flowlu('module/crm/lead/list', { page: String(page), limit: '100' });
        const items = r?.items ?? [];
        all.push(...items);
        if (items.length < 100) break;
      }
      const { data: existing } = await sb.from('flowlu_leads').select('id');
      const known = new Set((existing ?? []).map((e: any) => Number(e.id)));
      const rows = all.map((l) => {
        const s = scoreLead(l);
        const created = l.created_date && !String(l.created_date).startsWith('0000') ? new Date(String(l.created_date).replace(' ', 'T') + 'Z').toISOString() : null;
        return {
          id: Number(l.id), name: l.name ?? null, contact_name: l.contact_name || null, contact_email: l.contact_email || null,
          contact_phone: l.contact_phone || null, contact_company: l.contact_company || null, budget: Number(l.budget) || null,
          flowlu_created_at: created, score: s.score, priority: s.priority, score_reasons: s.reasons, raw: l, synced_at: new Date().toISOString(),
        };
      });
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await sb.from('flowlu_leads').upsert(rows.slice(i, i + 200), { onConflict: 'id' });
        if (error) throw new Error(error.message);
      }
      const added = rows.filter((r) => !known.has(r.id)).length;
      await sb.from('flowlu_settings').update({ last_sync_at: new Date().toISOString() }).eq('id', 1);
      return json({ ok: true, total: rows.length, new: added });
    }
    if (action === 'send_reply') {
      const leadId = Number(body.lead_id);
      const to = String(body.to ?? '').trim();
      const subject = String(body.subject ?? '').trim().slice(0, 250);
      const text = String(body.body ?? '').trim().slice(0, 20000);
      if (!leadId || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || !subject || !text) return json({ error: 'Lead, valid recipient, subject and message are required' }, 400);
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">${esc(text).replace(/\n/g, '<br>')}</div>`;
      const sent = await sendViaGmail(to, subject, html, text);
      let logged = false; let logError: string | null = null;
      if (sent.sent) {
        try {
          const lead = await flowlu(`module/crm/lead/get/${leadId}`);
          const stamp = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Prague' });
          const entry = `\n\n--- Email sent from FastMedia back office (${stamp}) ---\nTo: ${to}\nSubject: ${subject}\n\n${text}`;
          await flowlu(`module/crm/lead/update/${leadId}`, { description: (String(lead?.description ?? '') + entry).slice(-60000) }, 'POST');
          logged = true;
        } catch (e) { logError = (e as Error).message; }
      }
      const row = { flowlu_lead_id: leadId, to_email: to, subject, body: text, status: sent.sent ? 'sent' : 'failed', error: sent.error ?? logError, flowlu_logged: logged, sent_at: sent.sent ? new Date().toISOString() : null };
      if (body.reply_id) await sb.from('flowlu_lead_replies').update(row).eq('id', String(body.reply_id));
      else await sb.from('flowlu_lead_replies').insert(row);
      return json({ ok: sent.sent, flowlu_logged: logged, error: sent.error ?? logError, url: `https://${account()}.flowlu.com/crm/lead/view/${leadId}` }, sent.sent ? 200 : 502);
    }
    if (action === 'raw_get' || action === 'raw_post') {
      return json(await flowlu(String(body.path), body.params ?? {}, action === 'raw_post' ? 'POST' : 'GET'));
    }
    if (action === 'webhook_url') {
      return json({ url: `${SUPABASE_URL}/functions/v1/flowlu-webhook?token=${Deno.env.get('FLOWLU_WEBHOOK_SECRET') ?? ''}` });
    }
    if (action === 'retry_failed') {
      await sb.from('flowlu_sync_log').delete().eq('status', 'failed').eq('direction', 'push');
    }
    return json({ ok: true, ...(await syncAll(Number(body.limit) || 25)) });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

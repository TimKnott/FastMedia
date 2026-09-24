// Admin-gated Flowlu CRM bridge: test connection, push leads/enquiries/calls, show webhook URL.
// Also serves as the scheduled/auto sync endpoint (service role or cron secret).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

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
  let res: Response;
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
  const text = await res.text();
  let body: any = null;
  try { body = JSON.parse(text); } catch { /* html */ }
  if (!res.ok || body?.error) {
    throw new Error(`Flowlu ${res.status}: ${body?.error?.message ?? body?.error ?? text.slice(0, 160)}`);
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

async function createOpportunity(p: { name: string; email?: string | null; phone?: string | null; company?: string | null; description: string; source: string }) {
  const r = await flowlu('module/crm/lead/create', {
    name: `${p.source}: ${p.name}`.slice(0, 250),
    contact_name: p.name ?? '',
    contact_email: p.email ?? '',
    contact_phone: p.phone ?? '',
    contact_company: p.company ?? '',
    description: p.description.slice(0, 5000),
  }, 'POST');
  return r?.id ? String(r.id) : null;
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
        return json({ ok: false, message: msg, v: 2, acct_len: account().length });
      }
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

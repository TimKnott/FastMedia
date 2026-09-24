// Pushes a completed voice call into Flowlu CRM (contact + note).
// Stays a no-op until FLOWLU_ACCOUNT and FLOWLU_API_KEY secrets are set and
// voice_settings.flowlu_enabled is true.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const FLOWLU_ACCOUNT = Deno.env.get('FLOWLU_ACCOUNT') ?? ''; // e.g. "fastmedia" for fastmedia.flowlu.com
const FLOWLU_API_KEY = Deno.env.get('FLOWLU_API_KEY') ?? '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

function authorized(req: Request): boolean {
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  return !!SERVICE_ROLE && bearer === SERVICE_ROLE;
}

Deno.serve(async (req) => {
  if (!authorized(req)) return new Response('unauthorized', { status: 401 });
  const { call_id } = await req.json().catch(() => ({}));
  if (!call_id) return new Response(JSON.stringify({ error: 'call_id required' }), { status: 400 });

  const { data: settings } = await sb.from('voice_settings').select('flowlu_enabled').eq('id', 1).maybeSingle();
  if (!settings?.flowlu_enabled || !FLOWLU_ACCOUNT || !FLOWLU_API_KEY) {
    return new Response(JSON.stringify({ ok: true, skipped: 'flowlu_not_configured' }));
  }

  const { data: call } = await sb.from('voice_calls').select('*').eq('id', call_id).maybeSingle();
  if (!call || call.flowlu_synced) return new Response(JSON.stringify({ ok: true, skipped: 'already_synced_or_missing' }));

  const base = `https://${FLOWLU_ACCOUNT}.flowlu.com/api/v1`;
  const headers = { Authorization: `Bearer ${FLOWLU_API_KEY}`, 'Content-Type': 'application/json' };
  const phone = call.direction === 'inbound' ? call.from_number : call.to_number;

  try {
    // 1) Find or create the contact by phone
    let contactId: number | null = null;
    const search = await fetch(`${base}/module/crm/contact/list?phone=${encodeURIComponent(phone ?? '')}`, { headers });
    if (search.ok) {
      const j = await search.json();
      contactId = j?.response?.items?.[0]?.id ?? null;
    }
    if (!contactId) {
      const create = await fetch(`${base}/module/crm/contact/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: `Phone contact ${phone ?? 'unknown'}`, phone: phone ?? '', source: 'FastMedia voice agent' }),
      });
      if (create.ok) {
        const j = await create.json();
        contactId = j?.response?.id ?? null;
      }
    }
    // 2) Attach the call details as a note
    const note = [
      `Voice agent call (${call.direction}) — ${call.duration_seconds ?? 0}s`,
      call.summary ?? '',
      call.outcome ? `Outcome: ${call.outcome}` : '',
      call.recording_url ? `Recording: ${call.recording_url}` : '',
    ].filter(Boolean).join('\n');
    if (contactId) {
      await fetch(`${base}/module/crm/note/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ entity_type: 'contact', entity_id: contactId, text: note }),
      });
    }
    await sb.from('voice_calls').update({ flowlu_synced: true }).eq('id', call_id);
    return new Response(JSON.stringify({ ok: true, contact_id: contactId }));
  } catch (e) {
    console.error('flowlu sync failed', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 502 });
  }
});

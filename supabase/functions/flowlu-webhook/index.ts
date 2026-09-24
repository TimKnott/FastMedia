// Receives Flowlu webhook events (e.g. opportunity created/updated) and records them.
import { createClient } from 'npm:@supabase/supabase-js@2';

const sb = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const secret = Deno.env.get('FLOWLU_WEBHOOK_SECRET') ?? '';
  if (!secret || url.searchParams.get('token') !== secret) return new Response('unauthorized', { status: 401 });
  if (req.method === 'GET') return new Response('ok');

  const raw = await req.text();
  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(raw); } catch { payload = Object.fromEntries(new URLSearchParams(raw)); }
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const event = String(payload.event ?? payload.type ?? payload.action ?? 'event');
  const fid = String(data.id ?? payload.id ?? crypto.randomUUID());

  await sb.from('flowlu_sync_log').upsert({
    entity_type: `flowlu:${event}`.slice(0, 80), entity_id: fid, direction: 'pull',
    flowlu_id: fid, status: 'received', payload, created_at: new Date().toISOString(),
  }, { onConflict: 'entity_type,entity_id,direction' });

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});

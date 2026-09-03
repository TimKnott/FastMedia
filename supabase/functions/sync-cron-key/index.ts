// Temporary maintenance function: copies the current service role key into the
// Vault entry used by scheduled jobs. Protected by a one-time bootstrap token.
import { createClient } from 'npm:@supabase/supabase-js@2';

const BOOTSTRAP_TOKEN = 'fm-sync-2026-09-03-4d7a1c';

Deno.serve(async (req) => {
  if (req.headers.get('x-bootstrap-token') !== BOOTSTRAP_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!key) {
    return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not bound' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(url, key);
  const { error } = await admin.rpc('set_email_queue_service_key', { new_key: key });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true, keyLength: key.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

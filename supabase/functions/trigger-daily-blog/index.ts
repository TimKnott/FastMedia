// Public, throttled wrapper that pg_cron calls daily.
// It forwards to auto-generate-blog using the service role key (server-side only),
// but refuses to run if a successful generation happened in the last 20 hours.
// Callers must present the scheduled-job token or be an admin.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  // Only the scheduled job (x-job-token), the service role or an admin may trigger generation.
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Throttle: at most one successful run per 20 hours
  const since = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('blog_generation_log')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'success')
    .gte('triggered_at', since);

  if ((count ?? 0) > 0) {
    return new Response(JSON.stringify({ ok: true, skipped: 'already_ran_within_20h' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/auto-generate-blog`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ source: 'trigger-daily-blog' }),
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

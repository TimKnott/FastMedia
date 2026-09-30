// Shared authorization gate for internal jobs.
// Allows callers presenting: service-role bearer, matching x-cron-secret header,
// or an authenticated user JWT belonging to an admin role.
import { createClient } from 'npm:@supabase/supabase-js@2';

export async function isAuthorizedAdminCaller(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const cronSecret = req.headers.get('x-cron-secret') ?? '';
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const ANON = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  if (bearer && SERVICE_ROLE && bearer === SERVICE_ROLE) return true;
  if (CRON_SECRET && cronSecret && cronSecret === CRON_SECRET) return true;
  if (await hasValidJobToken(req)) return true;
  if (!bearer || !SUPABASE_URL || !ANON) return false;

  try {
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
    });
    const { data: claims } = await userClient.auth.getClaims(bearer);
    const uid = claims?.claims?.sub;
    if (!uid) return false;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: uid, _role: 'admin' });
    return !!isAdmin;
  } catch {
    return false;
  }
}

export function unauthorizedResponse(corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Scheduled jobs send `x-job-token`, matched against internal_job_tokens (name='scheduled_jobs'). */
export async function hasValidJobToken(req: Request): Promise<boolean> {
  const tok = req.headers.get('x-job-token') ?? '';
  if (tok.length < 32) return false;
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !key) return false;
  try {
    const admin = createClient(url, key);
    const { data } = await admin.from('internal_job_tokens').select('token').eq('name', 'scheduled_jobs').maybeSingle();
    return !!data?.token && data.token === tok;
  } catch {
    return false;
  }
}

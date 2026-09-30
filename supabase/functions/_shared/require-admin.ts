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
  // Also accept any current project secret key (scheduled jobs store one in the vault).
  if (bearer) {
    try {
      const raw = Deno.env.get('SUPABASE_SECRET_KEYS') ?? '';
      const parsed = raw ? JSON.parse(raw) : null;
      const vals: string[] = Array.isArray(parsed)
        ? parsed.map((v: unknown) => (typeof v === 'string' ? v : (v as { key?: string })?.key ?? '')).filter(Boolean)
        : parsed && typeof parsed === 'object' ? Object.values(parsed).map(String) : [];
      if (vals.includes(bearer)) return true;
    } catch { /* ignore */ }
  }
  if (CRON_SECRET && cronSecret && cronSecret === CRON_SECRET) return true;
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

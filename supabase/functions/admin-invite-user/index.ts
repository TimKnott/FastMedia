// Invite a new user by email and assign a role. Super-admin only.
// Uses Supabase Auth invite (sends email with sign-up link). On success,
// upserts the requested role into public.user_roles.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const SITE_URL = 'https://www.fastmedia.pro'

const ALLOWED_ROLES = ['admin', 'editor', 'moderator', 'user'] as const
type AllowedRole = typeof ALLOWED_ROLES[number]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const { data: isSuper } = await userClient.rpc('has_role', { _user_id: userData.user.id, _role: 'super_admin' })
    if (!isSuper) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json().catch(() => ({}))
    const emailRaw = String(body?.email ?? '').trim().toLowerCase()
    const role = String(body?.role ?? '') as AllowedRole
    if (!emailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      return new Response(JSON.stringify({ error: 'valid email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return new Response(JSON.stringify({ error: 'invalid role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Check if user already exists
    let userId: string | null = null
    let invited = false
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    const found = existing?.users?.find(u => (u.email ?? '').toLowerCase() === emailRaw)
    if (found) {
      userId = found.id
    } else {
      const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(emailRaw, {
        redirectTo: `${SITE_URL}/admin/login`,
      })
      if (inviteErr || !invite?.user) {
        throw new Error(inviteErr?.message || 'invite failed')
      }
      userId = invite.user.id
      invited = true
    }

    // Upsert role
    const { error: roleErr } = await admin
      .from('user_roles')
      .upsert({ user_id: userId!, role }, { onConflict: 'user_id,role' })
    if (roleErr) throw roleErr

    // Audit
    await admin.from('audit_logs').insert({
      action: invited ? 'user_invited' : 'role_assigned',
      entity_type: 'user_roles',
      entity_id: userId,
      user_id: userData.user.id,
      details: { email: emailRaw, role, invited },
    })

    return new Response(JSON.stringify({ ok: true, user_id: userId, invited, role }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('admin-invite-user error:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

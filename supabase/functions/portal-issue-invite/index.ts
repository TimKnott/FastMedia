// Issue a magic-link invite for a client to access their private project portal.
// Admin-only (requires authenticated editor JWT). Generates a long random token,
// stores it, and sends a transactional email with the unique URL.

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

function genToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

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

    // Verify caller is an editor
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const { data: hasRole } = await userClient.rpc('has_role', { _user_id: userData.user.id, _role: 'editor' })
    if (!hasRole) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json()
    const { project_id, email, expires_in_days, suppress_email } = body || {}
    if (!project_id || !email) {
      return new Response(JSON.stringify({ error: 'project_id and email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Verify project exists
    const { data: project, error: projErr } = await admin
      .from('client_projects')
      .select('id, name, client_name, slug')
      .eq('id', project_id)
      .single()
    if (projErr || !project) {
      return new Response(JSON.stringify({ error: 'project not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = genToken()
    const expiresAt = expires_in_days
      ? new Date(Date.now() + Number(expires_in_days) * 86400_000).toISOString()
      : null

    const { error: insertErr } = await admin.from('project_access_tokens').insert({
      project_id,
      token,
      email: email.toLowerCase().trim(),
      expires_at: expiresAt,
      created_by: userData.user.id,
    })
    if (insertErr) throw insertErr

    // Branded portal URL — slug masks the random token so the link reads as the
    // business name rather than a generic preview address.
    const slug = (project.slug || '').replace(/[^a-z0-9-]/gi, '').toLowerCase()
    const portalUrl = slug
      ? `${SITE_URL}/portal/${slug}/${token}`
      : `${SITE_URL}/portal/${token}`

    // Audit
    await admin.from('project_audit_log').insert({
      project_id,
      actor_type: 'admin',
      actor_label: userData.user.email || 'admin',
      action: 'invite_issued',
      details: { email, expires_at: expiresAt },
    })

    // Send email via existing transactional pipeline. Failures are surfaced in
    // the response (`email_status` / `email_error`) so the admin UI can display
    // why a portal invite did not reach the dispatcher queue. The invite token
    // itself is still returned so it can be copied/sent manually as a fallback.
    let emailStatus: 'queued' | 'skipped' | 'error' = 'skipped'
    let emailError: string | null = null
    let emailResponse: unknown = null

    if (!suppress_email) {
      const payload = {
        templateName: 'portal-invite',
        recipientEmail: email,
        idempotencyKey: `portal-invite-${token}`,
        templateData: {
          recipientName: project.client_name,
          projectName: project.name,
          portalUrl,
        },
      }
      console.log('[portal-issue-invite] dispatching email', {
        project_id,
        recipient: email,
        idempotencyKey: payload.idempotencyKey,
      })
      try {
        const { data: emailData, error: emailErr } = await admin.functions.invoke(
          'send-app-email',
          { body: payload },
        )
        emailResponse = emailData ?? null
        if (emailErr) {
          emailStatus = 'error'
          // FunctionsHttpError carries the response on .context — surface its body.
          let detail = emailErr.message || String(emailErr)
          const ctx = (emailErr as any).context
          if (ctx && typeof ctx.text === 'function') {
            try { detail += ` | body=${await ctx.text()}` } catch { /* ignore */ }
          }
          emailError = detail
          console.error('[portal-issue-invite] send-app-email failed', {
            recipient: email,
            error: detail,
            data: emailData,
          })
        } else {
          emailStatus = 'queued'
          console.log('[portal-issue-invite] send-app-email queued', {
            recipient: email,
            data: emailData,
          })
        }
      } catch (emailErr) {
        emailStatus = 'error'
        emailError = emailErr instanceof Error ? emailErr.message : String(emailErr)
        console.error('[portal-issue-invite] send-app-email threw', {
          recipient: email,
          error: emailError,
        })
      }
    } else {
      console.log('[portal-issue-invite] email suppressed by caller', { recipient: email })
    }

    return new Response(JSON.stringify({
      ok: true,
      token,
      portal_url: portalUrl,
      email_status: emailStatus,
      email_error: emailError,
      email_response: emailResponse,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('portal-issue-invite error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Public portal API. Validates the access token from the URL path and
// performs all client-side operations (load project, list/create notes,
// acknowledge agreement). Anon clients NEVER touch the DB tables directly —
// they call this function which uses the service role internally and only
// returns data scoped to the validated token.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-portal-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const COLOR_PALETTE = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#0f3a7a']

const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

async function loadToken(token: string) {
  if (!token || token.length < 32 || token.length > 128) return null
  const { data } = await admin
    .from('project_access_tokens')
    .select('id, project_id, email, revoked_at, expires_at')
    .eq('token', token)
    .maybeSingle()
  if (!data) return null
  if (data.revoked_at) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  return data
}

async function audit(projectId: string, action: string, ip: string, ua: string, details?: any) {
  await admin.from('project_audit_log').insert({
    project_id: projectId,
    actor_type: 'client',
    action,
    details,
    ip_address: ip,
    user_agent: ua,
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
  const ua = req.headers.get('user-agent') || ''

  try {
    const body = await req.json().catch(() => ({}))
    const { action, token } = body || {}

    if (!action || !token) {
      return new Response(JSON.stringify({ error: 'action and token required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenRow = await loadToken(token)
    if (!tokenRow) {
      return new Response(JSON.stringify({ error: 'invalid_or_expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Touch last_used_at (fire-and-forget)
    admin
      .from('project_access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenRow.id)
      .then(() => {})

    const projectId = tokenRow.project_id

    switch (action) {
      case 'load': {
        const { data: project } = await admin
          .from('client_projects')
          .select('id, name, slug, client_name, staging_url, status, brand_color, brand_color_secondary, logo_url, agreement_template, agreement_terms, agreement_acknowledged_at, currency, dev_fee, hosting_fee_yearly, ai_token_ratio, ai_cost_per_unit, ai_units_per_user, deposit_pct, late_penalty_pct_per_day, fee_line_items')
          .eq('id', projectId)
          .single()

        const { data: notes } = await admin
          .from('project_notes')
          .select('id, page_path, selector, x_pct, y_pct, viewport_w, viewport_h, message, color, status, author_type, author_name, created_at, updated_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })

        await audit(projectId, 'portal_loaded', ip, ua)

        return new Response(
          JSON.stringify({
            ok: true,
            project,
            notes: notes || [],
            client_email: tokenRow.email,
            color_palette: COLOR_PALETTE,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      case 'add_note': {
        const { note } = body
        if (!note?.message || typeof note.message !== 'string' || note.message.length > 2000) {
          return new Response(JSON.stringify({ error: 'invalid note' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        const color = COLOR_PALETTE.includes(note.color) ? note.color : COLOR_PALETTE[1]
        const { data: inserted, error } = await admin
          .from('project_notes')
          .insert({
            project_id: projectId,
            page_path: (note.page_path || '/').slice(0, 500),
            selector: note.selector ? String(note.selector).slice(0, 500) : null,
            x_pct: typeof note.x_pct === 'number' ? note.x_pct : null,
            y_pct: typeof note.y_pct === 'number' ? note.y_pct : null,
            viewport_w: note.viewport_w || null,
            viewport_h: note.viewport_h || null,
            message: note.message.trim(),
            color,
            author_type: 'client',
            author_name: note.author_name?.slice(0, 120) || null,
            author_email: tokenRow.email,
          })
          .select()
          .single()
        if (error) throw error
        await audit(projectId, 'note_added', ip, ua, { note_id: inserted.id })
        return new Response(JSON.stringify({ ok: true, note: inserted }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'update_note': {
        const { note_id, message, color } = body
        if (!note_id) return new Response(JSON.stringify({ error: 'note_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        // Clients can only edit their own notes
        const { data: existing } = await admin
          .from('project_notes')
          .select('id, project_id, author_type, author_email')
          .eq('id', note_id)
          .single()
        if (!existing || existing.project_id !== projectId) {
          return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        if (existing.author_type !== 'client' || existing.author_email !== tokenRow.email) {
          return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        const patch: Record<string, unknown> = {}
        if (typeof message === 'string') patch.message = message.trim().slice(0, 2000)
        if (color && COLOR_PALETTE.includes(color)) patch.color = color
        const { error } = await admin.from('project_notes').update(patch).eq('id', note_id)
        if (error) throw error
        await audit(projectId, 'note_updated', ip, ua, { note_id })
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'delete_note': {
        const { note_id } = body
        const { data: existing } = await admin
          .from('project_notes')
          .select('id, project_id, author_type, author_email')
          .eq('id', note_id)
          .single()
        if (!existing || existing.project_id !== projectId) {
          return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        if (existing.author_type !== 'client' || existing.author_email !== tokenRow.email) {
          return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        const { error } = await admin.from('project_notes').delete().eq('id', note_id)
        if (error) throw error
        await audit(projectId, 'note_deleted', ip, ua, { note_id })
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'acknowledge_agreement': {
        const { error } = await admin
          .from('client_projects')
          .update({
            agreement_acknowledged_at: new Date().toISOString(),
            agreement_ack_ip: ip,
            agreement_ack_user_agent: ua,
          })
          .eq('id', projectId)
        if (error) throw error
        await audit(projectId, 'agreement_acknowledged', ip, ua)
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'resend_draft': {
        // Rate-limit: only one resend per 5 minutes per project (audit-log based)
        const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString()
        const { count } = await admin
          .from('project_audit_log')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('action', 'draft_email_resent')
          .gte('created_at', fiveMinAgo)
        if ((count || 0) > 0) {
          return new Response(
            JSON.stringify({ error: 'rate_limited', message: 'Please wait a few minutes before resending again.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }

        const { data: project } = await admin
          .from('client_projects')
          .select('id, name, slug, client_name')
          .eq('id', projectId)
          .single()

        if (!project) {
          return new Response(JSON.stringify({ error: 'project_not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const safeSlug = (project.slug || '').replace(/[^a-z0-9-]/gi, '').toLowerCase()
        const portalUrl = safeSlug
          ? `https://fastmedia.pro/portal/${safeSlug}/${token}`
          : `https://fastmedia.pro/portal/${token}`

        const idempotencyKey = `resend-draft-${projectId}-${Date.now()}`
        const { error: emailErr } = await admin.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'client-stage-update',
            recipientEmail: tokenRow.email,
            idempotencyKey,
            templateData: {
              audience: 'client',
              stage: 'draft_created',
              recipientName: (project.client_name || '').split(' ')[0] || null,
              projectName: project.name,
              portalUrl,
            },
          },
        })

        if (emailErr) {
          console.error('resend_draft email error:', emailErr.message)
          return new Response(JSON.stringify({ error: 'email_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        await audit(projectId, 'draft_email_resent', ip, ua, { recipient: tokenRow.email })
        return new Response(JSON.stringify({ ok: true, sent_to: tokenRow.email }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      default:
        return new Response(JSON.stringify({ error: 'unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('portal-access error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

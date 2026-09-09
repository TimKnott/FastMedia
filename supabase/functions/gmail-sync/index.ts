// Mirror Google Workspace inbox messages into the admin inbox (inbound_emails).
// Read-only: it never changes mail delivery, DNS, or the Gmail account itself.
// Callable by an admin (JWT) or by cron/service-role.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!
const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY')!
const GATEWAY = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

function gwHeaders() {
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': GOOGLE_MAIL_API_KEY,
  }
}

function b64urlDecode(data: string): string {
  try {
    const norm = data.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(norm.padEnd(norm.length + ((4 - (norm.length % 4)) % 4), '='))
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
  } catch {
    return ''
  }
}

type Part = { mimeType?: string; body?: { data?: string }; parts?: Part[] }

function extractBodies(payload: Part | undefined): { text: string; html: string } {
  let text = ''
  let html = ''
  const walk = (p?: Part) => {
    if (!p) return
    const data = p.body?.data ? b64urlDecode(p.body.data) : ''
    if (data) {
      if (p.mimeType === 'text/plain' && !text) text = data
      else if (p.mimeType === 'text/html' && !html) html = data
      else if (!p.mimeType?.startsWith('multipart') && !text && !html) text = data
    }
    for (const child of p.parts ?? []) walk(child)
  }
  walk(payload)
  return { text, html }
}

function header(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return json({ error: 'unauthorized' }, 401)

    // Cron / service-role calls bypass the admin check.
    if (token !== SERVICE_ROLE) {
      const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } })
      const { data: userData } = await userClient.auth.getUser()
      if (!userData?.user) return json({ error: 'unauthorized' }, 401)
      const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' })
      if (!isAdmin) return json({ error: 'forbidden' }, 403)
    }

    if (!GOOGLE_MAIL_API_KEY || !LOVABLE_API_KEY) {
      return json({ error: 'Google mailbox is not connected yet.' }, 400)
    }

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const query: string = body.query || 'in:inbox newer_than:30d'
    const maxResults: number = Math.min(Number(body.maxResults) || 40, 100)

    const listRes = await fetch(
      `${GATEWAY}/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
      { headers: gwHeaders() },
    )
    if (!listRes.ok) {
      const details = await listRes.text()
      console.error(`Gmail list failed [${listRes.status}]: ${details}`)
      return json({ error: 'Gmail request failed', status: listRes.status, details }, listRes.status)
    }
    const list = await listRes.json()
    const ids: string[] = (list.messages ?? []).map((m: { id: string }) => m.id)
    if (ids.length === 0) return json({ imported: 0, skipped: 0, scanned: 0 })

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: existing } = await admin
      .from('inbound_emails')
      .select('mailgun_event_id')
      .in('mailgun_event_id', ids.map((id) => `gmail:${id}`))
    const known = new Set((existing ?? []).map((r: { mailgun_event_id: string }) => r.mailgun_event_id))
    const todo = ids.filter((id) => !known.has(`gmail:${id}`))

    let imported = 0
    for (const id of todo) {
      const msgRes = await fetch(`${GATEWAY}/users/me/messages/${id}?format=full`, { headers: gwHeaders() })
      if (!msgRes.ok) {
        console.error(`Gmail get ${id} failed [${msgRes.status}]: ${(await msgRes.text()).slice(0, 300)}`)
        continue
      }
      const msg = await msgRes.json()
      const headers = (msg.payload?.headers ?? []) as Array<{ name: string; value: string }>
      const { text, html } = extractBodies(msg.payload)
      const receivedAt = msg.internalDate ? new Date(Number(msg.internalDate)).toISOString() : new Date().toISOString()

      const { error } = await admin.from('inbound_emails').insert({
        mailgun_event_id: `gmail:${id}`,
        from_address: header(headers, 'From').slice(0, 320) || 'unknown',
        to_address: header(headers, 'To').slice(0, 320) || 'support@fastmedia.pro',
        subject: header(headers, 'Subject') || null,
        body_plain: text || msg.snippet || null,
        body_html: html || null,
        status: 'received',
        created_at: receivedAt,
      })
      if (error) {
        if (!`${error.message}`.includes('duplicate')) console.error('insert failed:', error.message)
        continue
      }
      imported++
    }

    return json({ imported, scanned: ids.length, skipped: ids.length - todo.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('gmail-sync error:', message)
    return json({ error: message }, 500)
  }
})

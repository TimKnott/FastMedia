import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const GATEWAY = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'

const b64 = (s: string) =>
  btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(''))

const headerValue = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const connectionKey = Deno.env.get('GOOGLE_MAIL_API_KEY')
  if (!lovableKey || !connectionKey) {
    return json({ error: 'Google mailbox is not connected for this project.' }, 500)
  }

  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  if (!token) return json({ error: 'Unauthorized' }, 401)

  const admin = createClient(supabaseUrl, serviceKey)
  const { data: userData } = await admin.auth.getUser(token)
  const user = userData?.user
  if (!user) return json({ error: 'Unauthorized' }, 401)
  const { data: isAdmin } = await admin.rpc('has_role', { _user_id: user.id, _role: 'admin' })
  if (!isAdmin) return json({ error: 'Admin access required' }, 403)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const to = typeof body.to === 'string' ? body.to.trim().slice(0, 200) : ''
  const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 300) : ''
  const message = typeof body.body === 'string' ? body.body.trim().slice(0, 20000) : ''
  const threadId = typeof body.threadId === 'string' ? body.threadId : undefined
  const inboundId = typeof body.inboundId === 'string' ? body.inboundId : undefined

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return json({ error: 'A valid recipient is required.' }, 400)
  if (!message) return json({ error: 'The reply cannot be empty.' }, 400)

  const raw = [
    `To: ${to}`,
    `Subject: ${headerValue(subject || 'Re: your message to FastMedia.Pro')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    message,
  ].join('\r\n')

  const payload: Record<string, unknown> = {
    raw: b64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  }
  if (threadId) payload.threadId = threadId

  const res = await fetch(`${GATEWAY}/users/me/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': connectionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const details = await res.text()
    console.error(`Gmail send failed [${res.status}]: ${details}`)
    return json({ error: 'Google rejected the reply.', status: res.status, details }, res.status)
  }

  const sent = await res.json()

  if (inboundId) {
    await admin
      .from('inbound_emails')
      .update({ status: 'replied', ai_reply: message, processed_at: new Date().toISOString() })
      .eq('id', inboundId)
  }

  await admin.from('email_send_log').insert({
    message_id: sent?.id ?? null,
    template_name: 'admin-inbox-reply',
    recipient_email: to,
    status: 'sent',
    metadata: { via: 'google_workspace', threadId: sent?.threadId ?? null, inboundId: inboundId ?? null },
  })

  return json({ success: true, id: sent?.id ?? null, threadId: sent?.threadId ?? null })
})

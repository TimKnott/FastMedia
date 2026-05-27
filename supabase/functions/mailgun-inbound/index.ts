// Mailgun inbound webhook → AI autoresponder
// Receives forwarded inbound emails from Mailgun Routes, verifies signature,
// generates an AI reply via Lovable AI Gateway, and sends it back via send-transactional-email.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MAILGUN_SIGNING_KEY = Deno.env.get('MAILGUN_WEBHOOK_SIGNING_KEY') || ''
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!
const NOTIFICATION_EMAIL = Deno.env.get('NOTIFICATION_EMAIL') || ''
const VBOUT_API_KEY = Deno.env.get('VBOUT_API_KEY') || ''
const SITE_NAME = 'FastMedia.Pro'

async function forwardToAdmin(supabase: any, payload: {
  fromAddress: string; fromName?: string; toAddress: string;
  subject: string; bodyPlain: string; aiReply?: string; status: string; messageId: string;
}) {
  if (!NOTIFICATION_EMAIL) return
  try {
    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'inbound-forward',
        recipientEmail: NOTIFICATION_EMAIL,
        idempotencyKey: `inbound-fwd-${payload.messageId}`,
        templateData: payload,
      },
    })
  } catch (err) {
    console.error('forwardToAdmin failed:', err instanceof Error ? err.message : err)
  }
}

async function syncToVbout(opts: { email: string; name?: string; subject?: string }) {
  if (!VBOUT_API_KEY) return
  try {
    const body = new URLSearchParams({
      key: VBOUT_API_KEY,
      email: opts.email,
      firstname: opts.name || '',
      status: 'active',
      ipaddress: '0.0.0.0',
      source: `inbound:${(opts.subject || 'support').slice(0, 60)}`,
    })
    const res = await fetch('https://api.vbout.com/1/emailmarketing/addcontact.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) {
      console.warn('Vbout sync non-OK:', res.status, (await res.text()).slice(0, 200))
    }
  } catch (err) {
    console.error('syncToVbout failed:', err instanceof Error ? err.message : err)
  }
}

async function verifyMailgunSignature(timestamp: string, token: string, signature: string) {
  if (!MAILGUN_SIGNING_KEY) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(MAILGUN_SIGNING_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(timestamp + token))
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return expected === signature
}

function extractEmail(addr: string): { email: string; name?: string } {
  const m = addr?.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/)
  if (m) return { name: m[1].trim() || undefined, email: m[2].trim().toLowerCase() }
  return { email: (addr || '').trim().toLowerCase() }
}

function stripQuoted(text: string): string {
  if (!text) return ''
  // Strip common quoted-reply markers; keep the new content only.
  const lines = text.split(/\r?\n/)
  const out: string[] = []
  for (const line of lines) {
    if (/^>+\s?/.test(line)) break
    if (/^On\s.+wrote:\s*$/i.test(line)) break
    if (/^-----\s*Original Message\s*-----/i.test(line)) break
    if (/^From:\s.+/i.test(line) && out.length > 3) break
    out.push(line)
  }
  return out.join('\n').trim().slice(0, 6000)
}

async function generateAiReply(opts: {
  fromName?: string; fromEmail: string; subject: string; body: string;
}): Promise<string> {
  const system = `You are the front-line support agent for ${SITE_NAME}, a premium digital agency that builds high-converting websites for tradespeople and creates video/marketing content. Operate in UK English unless the customer writes in another language — then mirror their language.

GUIDELINES:
- Be concise (120–180 words), warm, professional, and concrete.
- If pricing comes up: mention starter packages from CZK 4,990 and that detailed quotes are tailored on the AI calculator at https://fastmedia.pro/calculator.
- For booking/consultation requests: invite them to book a free consultation at https://fastmedia.pro/inquiry or via WhatsApp +44 7926 400060.
- For technical/support issues: acknowledge, ask for one specific clarifying detail, promise human follow-up within 1 working day.
- For partnership/press: thank them and forward to support@fastmedia.pro for human handling.
- NEVER invent prices, dates, contracts, or commitments not listed above.
- NEVER include a signature, salutation, or "Best regards" — the email template handles that.
- Output plain text only, no markdown headings.`

  const user = `INBOUND EMAIL
From: ${opts.fromName ? opts.fromName + ' <' + opts.fromEmail + '>' : opts.fromEmail}
Subject: ${opts.subject || '(no subject)'}

${opts.body || '(empty body)'}`

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return (data.choices?.[0]?.message?.content || '').trim()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

  try {
    const ct = req.headers.get('content-type') || ''
    let form: FormData
    if (ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded')) {
      form = await req.formData()
    } else {
      // Mailgun always sends form data; reject anything else
      return new Response('Unsupported content type', { status: 415, headers: corsHeaders })
    }

    const get = (k: string) => (form.get(k)?.toString() || '')

    const timestamp = get('timestamp')
    const token = get('token')
    const signature = get('signature')

    const valid = await verifyMailgunSignature(timestamp, token, signature)
    if (!valid) {
      console.warn('mailgun-inbound: invalid signature')
      return new Response('Invalid signature', { status: 401, headers: corsHeaders })
    }

    const fromRaw = get('From') || get('from')
    const toRaw = get('To') || get('recipient') || get('to')
    const subject = get('Subject') || get('subject')
    const bodyPlain = get('stripped-text') || get('body-plain')
    const bodyHtml = get('body-html')
    const messageId = get('Message-Id') || token

    const { name: fromName, email: fromEmail } = extractEmail(fromRaw)
    const { email: toEmail } = extractEmail(toRaw)

    if (!fromEmail) {
      return new Response('Missing sender', { status: 400, headers: corsHeaders })
    }

    // Idempotency: skip duplicates
    const { data: existing } = await supabase
      .from('inbound_emails')
      .select('id, status')
      .eq('mailgun_event_id', messageId)
      .maybeSingle()
    if (existing) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Auto-reply guard: skip bounces, auto-responders, mailing lists, our own outbound
    const headers = (get('message-headers') || '').toLowerCase()
    const skipReply =
      /precedence:\s*(bulk|junk|list)/i.test(headers) ||
      /auto-submitted:\s*(?!no)/i.test(headers) ||
      fromEmail.includes('mailer-daemon') ||
      fromEmail.includes('postmaster@') ||
      fromEmail.includes('noreply') ||
      fromEmail.includes('no-reply') ||
      fromEmail.endsWith('@fastmedia.pro')

    const cleanBody = stripQuoted(bodyPlain)

    // Insert record first
    const { data: inserted, error: insertErr } = await supabase
      .from('inbound_emails')
      .insert({
        mailgun_event_id: messageId,
        from_address: fromEmail,
        to_address: toEmail || 'support@fastmedia.pro',
        subject,
        body_plain: cleanBody,
        body_html: bodyHtml || null,
        status: skipReply ? 'skipped' : 'received',
      })
      .select('id')
      .single()

    if (insertErr) throw insertErr
    const recordId = inserted!.id

    if (skipReply) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate AI reply
    let aiReply = ''
    try {
      aiReply = await generateAiReply({
        fromName,
        fromEmail,
        subject,
        body: cleanBody,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('AI generation failed:', msg)
      await supabase
        .from('inbound_emails')
        .update({ status: 'ai_failed', error_message: msg, processed_at: new Date().toISOString() })
        .eq('id', recordId)
      return new Response(JSON.stringify({ ok: false, error: 'ai_failed' }), {
        status: 200, // ack to Mailgun so it doesn't retry
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!aiReply) {
      await supabase
        .from('inbound_emails')
        .update({ status: 'ai_empty', processed_at: new Date().toISOString() })
        .eq('id', recordId)
      return new Response(JSON.stringify({ ok: true, empty: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send the reply via the existing transactional pipeline
    const idempotencyKey = `ai-inbound-${messageId}`
    const { error: sendErr } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'ai-inbound-reply',
        recipientEmail: fromEmail,
        idempotencyKey,
        templateData: {
          recipientName: fromName,
          originalSubject: subject,
          aiReply,
        },
      },
    })

    if (sendErr) {
      const msg = sendErr.message || String(sendErr)
      console.error('Send failed:', msg)
      await supabase
        .from('inbound_emails')
        .update({ status: 'send_failed', ai_reply: aiReply, error_message: msg, processed_at: new Date().toISOString() })
        .eq('id', recordId)
      return new Response(JSON.stringify({ ok: false, error: 'send_failed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase
      .from('inbound_emails')
      .update({ status: 'replied', ai_reply: aiReply, processed_at: new Date().toISOString() })
      .eq('id', recordId)

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('mailgun-inbound error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

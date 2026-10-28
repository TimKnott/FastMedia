import { createClient } from 'npm:@supabase/supabase-js@2'
import { ALERT_RECIPIENTS } from '../_shared/alert-recipients.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const str = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t) return null
  return t.slice(0, max)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ error: 'Server configuration error' }, 500)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const ALLOWED_KINDS = ['contact', 'quote', 'offer']
  const kind = typeof body.kind === 'string' && ALLOWED_KINDS.includes(body.kind) ? body.kind : 'contact'
  const name = str(body.name, 120)
  const email = str(body.email, 200)
  const phone = str(body.phone, 40)
  const company = str(body.company, 160)
  const message = str(body.message, 5000)

  const partial = body.partial === true
  const sessionKey = str(body.sessionKey, 80)

  if (!partial) {
    if (!name) return json({ error: 'Please enter your name.' }, 400)
    if (!email || !EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400)
    if (!message) return json({ error: 'Please tell us how we can help.' }, 400)
  }
  if (partial && !sessionKey) return json({ error: 'A session key is required for partial saves.' }, 400)
  if (email && !EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400)

  const safeName = name ?? 'Wizard in progress'
  const safeEmail = email ?? 'no-email-yet@fastmedia.pro'
  const safeMessage = message ?? 'Wizard in progress — no message yet.'

  // Only string key/value pairs, capped, are accepted as extra details.
  const details: Record<string, string> = {}
  if (body.details && typeof body.details === 'object' && !Array.isArray(body.details)) {
    for (const [k, v] of Object.entries(body.details as Record<string, unknown>).slice(0, 20)) {
      const key = str(k, 60)
      const val = str(v, 500)
      if (key && val) details[key] = val
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  if (sessionKey) details.Session = sessionKey

  // Portfolio sites post here too: record which website the enquiry came from.
  const origin = req.headers.get('origin') || req.headers.get('referer') || ''
  let sourceHost = ''
  try { sourceHost = origin ? new URL(origin).hostname.replace(/^www\./, '') : '' } catch { /* ignore */ }
  if (sourceHost && sourceHost !== 'fastmedia.pro') details['Source website'] = sourceHost.slice(0, 120)
  const requestType = str(body.type, 40)
  if (requestType) details['Request type'] = requestType

  const row = {
    kind,
    name: safeName,
    email: safeEmail,
    phone,
    company,
    message: safeMessage,
    details,
    status: partial ? 'in_progress' : 'new',
  }

  // A wizard session keeps updating the same row as the visitor moves through the steps.
  let existingId: string | null = null
  if (sessionKey) {
    const { data: existing } = await supabase
      .from('contact_enquiries')
      .select('id')
      .eq('kind', kind)
      .eq('details->>Session', sessionKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    existingId = existing?.id ?? null
  }

  let inserted: { id: string }
  if (existingId) {
    const { data: updated, error: updateError } = await supabase
      .from('contact_enquiries')
      .update(row)
      .eq('id', existingId)
      .select('id')
      .single()
    if (updateError || !updated) {
      console.error('Failed to update enquiry', updateError)
      return json({ error: 'Could not save your enquiry. Please try again.' }, 500)
    }
    inserted = updated
  } else {
    const { data: created, error: insertError } = await supabase
      .from('contact_enquiries')
      .insert(row)
      .select('id')
      .single()
    if (insertError || !created) {
      console.error('Failed to store enquiry', insertError)
      return json({ error: 'Could not save your enquiry. Please try again.' }, 500)
    }
    inserted = created
  }

  // Partial saves are follow-up material only — never email them.
  if (partial) {
    return json({ success: true, id: inserted.id, partial: true, emailStatus: 'skipped' })
  }

  let emailStatus = 'skipped'
  let emailMessageId: string | null = null

  for (const owner of ALERT_RECIPIENTS) {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-app-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          templateName: 'contact-enquiry',
          recipientEmail: owner,
          idempotencyKey: `enquiry-${inserted.id}-${owner}`,
          templateData: {
            kind, name: safeName, email: safeEmail, phone, company, message: safeMessage, details, enquiryId: inserted.id,
          },
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (res.ok && result?.success !== false) {
        if (emailStatus !== 'failed') emailStatus = 'queued'
        emailMessageId = result?.messageId ?? result?.message_id ?? null
      } else {
        emailStatus = 'failed'
        console.error('Enquiry notification failed', res.status, result)
      }
    } catch (err) {
      emailStatus = 'failed'
      console.error('Enquiry notification threw', err)
    }
  }

  await supabase
    .from('contact_enquiries')
    .update({ email_status: emailStatus, email_message_id: emailMessageId })
    .eq('id', inserted.id)

  return json({ success: true, id: inserted.id, emailStatus, messageId: emailMessageId })
})

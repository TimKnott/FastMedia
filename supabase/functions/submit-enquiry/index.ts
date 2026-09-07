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

  const kind = body.kind === 'quote' ? 'quote' : 'contact'
  const name = str(body.name, 120)
  const email = str(body.email, 200)
  const phone = str(body.phone, 40)
  const company = str(body.company, 160)
  const message = str(body.message, 5000)

  if (!name) return json({ error: 'Please enter your name.' }, 400)
  if (!email || !EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email address.' }, 400)
  if (!message) return json({ error: 'Please tell us how we can help.' }, 400)

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

  const { data: inserted, error: insertError } = await supabase
    .from('contact_enquiries')
    .insert({ kind, name, email, phone, company, message, details })
    .select('id')
    .single()

  if (insertError) {
    console.error('Failed to store enquiry', insertError)
    return json({ error: 'Could not save your enquiry. Please try again.' }, 500)
  }

  const owner = Deno.env.get('PRIVATE_FORWARD_EMAIL') || Deno.env.get('NOTIFICATION_EMAIL')
  let emailStatus = 'skipped'
  let emailMessageId: string | null = null

  if (owner) {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          templateName: 'contact-enquiry',
          recipientEmail: owner,
          idempotencyKey: `enquiry-${inserted.id}`,
          templateData: {
            kind, name, email, phone, company, message, details, enquiryId: inserted.id,
          },
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (res.ok && result?.success !== false) {
        emailStatus = 'queued'
        emailMessageId = result?.messageId ?? result?.message_id ?? null
      } else {
        emailStatus = 'failed'
        console.error('Enquiry notification failed', res.status, result)
      }
    } catch (err) {
      emailStatus = 'failed'
      console.error('Enquiry notification threw', err)
    }
  } else {
    console.error('No PRIVATE_FORWARD_EMAIL / NOTIFICATION_EMAIL configured')
  }

  await supabase
    .from('contact_enquiries')
    .update({ email_status: emailStatus, email_message_id: emailMessageId })
    .eq('id', inserted.id)

  return json({ success: true, id: inserted.id, emailStatus, messageId: emailMessageId })
})

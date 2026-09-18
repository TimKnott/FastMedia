import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'
import { renderTemplateEmail, sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'
import { gmailFallbackAvailable, sendViaGmail } from '../_shared/gmail-fallback.ts'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

// Public-callable templates: safe for anonymous callers because their content
// is fully controlled by the template itself, and — for admin-facing
// notifications — the recipient is forced server-side to the owner address.
const PUBLIC_TEMPLATES = new Set<string>([
  'newsletter-welcome',
  'admin-newsletter-notification',
  'intake-received',
  'lead-notification',
  'booking-confirmation',
  'admin-booking-notification',
])

// Templates whose recipient must ALWAYS be forced to the owner address.
const OWNER_NOTIFICATION_TEMPLATES = new Set<string>([
  'admin-newsletter-notification',
  'admin-booking-notification',
  'lead-notification',
])

async function isPrivilegedCaller(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!bearer) return false
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (SERVICE_ROLE && bearer === SERVICE_ROLE) return true
  try {
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${bearer}` } } },
    )
    const { data: claims } = await userClient.auth.getClaims(bearer)
    const uid = claims?.claims?.sub
    if (!uid) return false
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, SERVICE_ROLE)
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: uid, _role: 'admin' })
    return !!isAdmin
  } catch {
    return false
  }
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return json({ error: 'Server configuration error' }, 500)
  }

  let templateName: string
  let recipientEmail: string
  let idempotencyKey: string
  let templateData: Record<string, any> = {}
  const messageId = crypto.randomUUID()
  try {
    const body = await req.json()
    templateName = body.templateName || body.template_name
    recipientEmail = body.recipientEmail || body.recipient_email
    idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId
    if (body.templateData && typeof body.templateData === 'object') {
      templateData = body.templateData
    }
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400)
  }

  if (!templateName) return json({ error: 'templateName is required' }, 400)

  const template = TEMPLATES[templateName]
  if (!template) {
    console.error('Template not found in registry', { templateName })
    return json(
      { error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}` },
      404,
    )
  }

  const privileged = await isPrivilegedCaller(req)
  if (!privileged && !PUBLIC_TEMPLATES.has(templateName)) {
    return json({ error: 'Not authorized to send this template' }, 403)
  }

  let effectiveRecipient = template.to || recipientEmail
  if (!privileged && OWNER_NOTIFICATION_TEMPLATES.has(templateName)) {
    const owner = Deno.env.get('PRIVATE_FORWARD_EMAIL') || Deno.env.get('NOTIFICATION_EMAIL')
    if (owner) effectiveRecipient = owner
  }

  if (!effectiveRecipient) {
    return json(
      { error: 'recipientEmail is required (unless the template defines a fixed recipient)' },
      400,
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const logSend = async (status: string, errorMessage?: string) => {
    const { error } = await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status,
      error_message: errorMessage ?? null,
    })
    if (error) console.error('Failed to write email_send_log', { status, error: error.message })
  }

  try {
    const result = await sendTemplateEmail(templateName, effectiveRecipient, {
      templateData,
      idempotencyKey,
    })

    if (!result.sent) {
      await logSend('suppressed', 'Recipient is suppressed (bounce, complaint, or unsubscribe)')
      console.log('Email suppressed', { templateName })
      return json({ success: false, reason: 'email_suppressed', messageId })
    }

    await logSend('sent')
    console.log('Transactional email sent', { templateName })
    return json({ success: true, sent: true, messageId })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await logSend('failed', message.slice(0, 500))
    console.error('Failed to send transactional email', { templateName, error: message })
    return json({ error: 'Failed to send email', detail: message.slice(0, 500), messageId }, 500)
  }
})

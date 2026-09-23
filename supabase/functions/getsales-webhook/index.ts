// Public endpoint for GetSales.io webhooks.
//
// Handles LinkedIn replies and newly added / exported contacts, routing both into
// the lead review queue (public.prospects) with an audit-trail entry.
//
// Authentication: GetSales cannot sign its webhooks, so the endpoint requires the
// shared secret from GETSALES_WEBHOOK_SECRET, passed either as ?secret=... in the
// webhook URL or as an x-getsales-secret header. Everything else is rejected.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-getsales-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const SECRET = Deno.env.get('GETSALES_WEBHOOK_SECRET') ?? ''

const REPLY_EVENTS = ['replied', 'reply', 'linkedin_reply', 'contact_replied_linkedin_message', 'contact_replied_email']
const BLOCK_EVENTS = ['blocked', 'contact_blocked', 'unsubscribed', 'email_bounced']

const pick = (source: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return ''
}

const flatten = (body: Record<string, unknown>): Record<string, unknown> => {
  const nested = ['lead', 'contact', 'data', 'payload', 'person'].reduce<Record<string, unknown>>((acc, key) => {
    const value = body[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) Object.assign(acc, value as Record<string, unknown>)
    return acc
  }, {})
  return { ...nested, ...body }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const url = new URL(req.url)
  const provided = url.searchParams.get('secret') ?? req.headers.get('x-getsales-secret') ?? ''
  if (!SECRET || provided !== SECRET) return json({ error: 'Unauthorized' }, 401)

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'Expected a JSON body' }, 400)
  }

  const flat = flatten(body)
  const rawEvent = pick(flat, ['event', 'event_type', 'type', 'webhook', 'webhook_type', 'action']).toLowerCase()
  const event = rawEvent.replace(/[\s-]+/g, '_')

  const email = pick(flat, ['email', 'work_email', 'primary_email', 'contact_email']).toLowerCase()
  const linkedinUrl = pick(flat, ['linkedin_url', 'linkedin', 'profile_url', 'linkedin_profile_url'])
  const firstName = pick(flat, ['first_name', 'firstName'])
  const lastName = pick(flat, ['last_name', 'lastName'])
  const fullName = pick(flat, ['full_name', 'name', 'fullName']) || [firstName, lastName].filter(Boolean).join(' ')
  const company = pick(flat, ['company_name', 'company', 'organization', 'organisation']) || fullName || email || 'LinkedIn contact'
  const leadId = pick(flat, ['id', 'lead_id', 'contact_id'])
  const message = pick(flat, ['message', 'text', 'body', 'last_message', 'reply_text'])

  if (!email && !linkedinUrl && !leadId) {
    return json({ error: 'The webhook carried no contact to match on.' }, 400)
  }

  const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

  // Find the prospect by GetSales ID, then email, then LinkedIn profile.
  let prospect: Record<string, unknown> | null = null
  if (leadId) {
    const { data } = await db.from('prospects').select('*').eq('getsales_lead_id', leadId).maybeSingle()
    prospect = data ?? null
  }
  if (!prospect && email) {
    const { data } = await db.from('prospects').select('*').ilike('email', email).maybeSingle()
    prospect = data ?? null
  }
  if (!prospect && linkedinUrl) {
    const { data } = await db.from('prospects').select('*').eq('linkedin_url', linkedinUrl).maybeSingle()
    prospect = data ?? null
  }

  const isReply = REPLY_EVENTS.some((key) => event.includes(key))
  const isBlock = BLOCK_EVENTS.some((key) => event.includes(key))
  const now = new Date().toISOString()

  const noteLines = [
    `From GetSales (${rawEvent || 'contact added'})`,
    linkedinUrl ? `LinkedIn: ${linkedinUrl}` : '',
    message ? `Message: ${message.slice(0, 400)}` : '',
  ].filter(Boolean)

  if (!prospect) {
    // Newly added GetSales contact — create it in the lead review queue.
    const insertEmail = email || `getsales-${leadId || crypto.randomUUID()}@linkedin.invalid`
    const { data: created, error } = await db
      .from('prospects')
      .insert({
        company,
        contact_name: fullName || null,
        email: insertEmail,
        website: pick(flat, ['website', 'company_website', 'domain']) || null,
        region: pick(flat, ['location', 'region', 'country', 'city']) || null,
        source: 'getsales',
        source_id: leadId || null,
        getsales_lead_id: leadId || null,
        linkedin_url: linkedinUrl || null,
        getsales_synced_at: now,
        notes: noteLines.join('\n'),
        status: isReply ? 'replied' : 'new',
        replied_at: isReply ? now : null,
      })
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('getsales-webhook insert failed', error)
      return json({ error: error.message }, 500)
    }

    await db.from('outreach_events').insert({
      prospect_id: created?.id ?? null,
      action: isReply ? 'getsales_reply' : 'getsales_contact_added',
      actor_type: 'system',
      actor_label: 'GetSales',
      details: { event: rawEvent, lead_id: leadId || null, linkedin_url: linkedinUrl || null, message: message.slice(0, 500) },
    })

    return json({ ok: true, created: true, prospect_id: created?.id ?? null, handled: isReply ? 'reply' : 'contact_added' })
  }

  // Known prospect — update the queue entry and stop anything still pending.
  const update: Record<string, unknown> = {
    getsales_lead_id: leadId || prospect.getsales_lead_id,
    linkedin_url: linkedinUrl || prospect.linkedin_url,
    getsales_synced_at: now,
  }
  if (fullName && !prospect.contact_name) update.contact_name = fullName

  if (isReply) {
    update.status = 'replied'
    update.replied_at = prospect.replied_at ?? now
  } else if (isBlock) {
    update.status = 'unsubscribed'
    update.unsubscribed_at = prospect.unsubscribed_at ?? now
  }
  if (message) {
    update.notes = [prospect.notes, noteLines.join('\n')].filter(Boolean).join('\n\n').slice(0, 4000)
  }

  await db.from('prospects').update(update).eq('id', prospect.id)

  if (isReply || isBlock) {
    // A human is talking to us (or has said no) — cancel everything still queued.
    await db
      .from('outreach_messages')
      .update({ status: 'cancelled', cancelled_at: now })
      .eq('prospect_id', prospect.id)
      .in('status', ['draft', 'pending_approval', 'approved', 'scheduled'])
  }

  await db.from('outreach_events').insert({
    prospect_id: prospect.id,
    action: isReply ? 'getsales_reply' : isBlock ? 'getsales_blocked' : 'getsales_contact_updated',
    actor_type: 'system',
    actor_label: 'GetSales',
    details: { event: rawEvent, lead_id: leadId || null, linkedin_url: linkedinUrl || null, message: message.slice(0, 500) },
  })

  return json({ ok: true, created: false, prospect_id: prospect.id, handled: isReply ? 'reply' : isBlock ? 'blocked' : 'updated' })
})

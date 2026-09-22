// Outbound prospecting + customer communication agent.
//
// Actions (admin-gated):
//   research  - build a prospect profile from their public website + AI analysis
//   draft     - write a personalised 3-step British-English email sequence
//   approve   - human approval gate: send the opener, schedule the follow-ups
//   tick      - cron: reply detection, autonomous follow-ups, abandoned-form recovery
//
// Nothing is ever sent before a human approves the opener for that prospect.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'
import { gmailFallbackAvailable, sendViaGmail } from '../_shared/gmail-fallback.ts'
import { generateJson } from '../_shared/ai-json.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FOLLOW_UP_DAYS = [4, 9]
const REPLY_TO = Deno.env.get('OUTREACH_REPLY_TO') ?? 'support@fastmedia.pro'
const SITE = 'https://www.fastmedia.pro'

type Db = ReturnType<typeof createClient>

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

function htmlFromText(body: string, footer: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br/>').replace(/</g, '&lt;')}</p>`)
    .join('')
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1c1c1c">${paragraphs}<p style="margin:22px 0 0;font-size:12px;color:#6b7280">${footer}</p></div>`
}

const footerFor = (language: string) =>
  language === 'cs'
    ? `FastMedia.Pro · Timothy Knott, IČO 17308551 · Louny 440 01, Ústecký kraj. Nechcete další zprávy? Odpovězte „STOP“ a už se neozveme.`
    : `FastMedia.Pro · Timothy Knott, IČO 17308551 · Louny 440 01, Czech Republic. Prefer no further emails? Reply “STOP” and we will not contact you again.`

async function fetchSiteText(website?: string | null): Promise<string> {
  if (!website) return ''
  const url = /^https?:\/\//i.test(website) ? website : `https://${website}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FastMediaProspectBot/1.0 (+https://www.fastmedia.pro)' },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return ''
    const html = await res.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000)
  } catch {
    return ''
  }
}

const RESEARCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'industry', 'signals', 'pain_points', 'hooks', 'fit_score', 'recommended_offer'],
  properties: {
    summary: { type: 'string' },
    industry: { type: 'string' },
    signals: { type: 'array', items: { type: 'string' } },
    pain_points: { type: 'array', items: { type: 'string' } },
    hooks: { type: 'array', items: { type: 'string' } },
    fit_score: { type: 'integer' },
    recommended_offer: { type: 'string' },
  },
}

const SEQUENCE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['messages'],
  properties: {
    messages: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['step', 'subject', 'body'],
        properties: {
          step: { type: 'integer' },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
      },
    },
  },
}

async function runResearch(db: Db, prospectId: string) {
  const { data: prospect, error } = await db.from('prospects').select('*').eq('id', prospectId).single()
  if (error || !prospect) throw new Error('prospect_not_found')

  await db.from('prospects').update({ status: 'researching' }).eq('id', prospectId)

  const siteText = await fetchSiteText(prospect.website)
  const result = await generateJson<Record<string, unknown>>(
    [
      `Company: ${prospect.company}`,
      `Contact: ${prospect.contact_name ?? 'unknown'}`,
      `Website: ${prospect.website ?? 'none provided'}`,
      `Region: ${prospect.region ?? 'Czech Republic'}`,
      `Trade / sector hint: ${prospect.trade ?? 'unknown'}`,
      `Internal notes: ${prospect.notes ?? 'none'}`,
      '',
      siteText ? `Public website text (truncated):\n${siteText}` : 'No website text could be read.',
    ].join('\n'),
    {
      instructions: [
        'You research prospects for FastMedia.Pro, a Czech-based studio selling high-end localised websites, video and AI lead tools to trades and small businesses (British English only).',
        'Analyse only the evidence supplied. Never invent statistics, awards, client names or claims you cannot see in the text.',
        'signals: concrete observations about their current web presence. pain_points: likely commercial problems. hooks: specific, factual personalisation openers a human could verify.',
        'fit_score: 0-100 for how well FastMedia.Pro can help them; be conservative when evidence is thin.',
        'recommended_offer: which FastMedia.Pro package or service fits best, in one sentence.',
        'Keep every string under 300 characters. Up to 4 items per array.',
      ].join(' '),
      schema: RESEARCH_SCHEMA,
      schemaName: 'prospect_research',
    },
  )

  const fit = Math.max(0, Math.min(100, Number(result.fit_score) || 0))
  await db
    .from('prospects')
    .update({
      research: { ...result, fit_score: fit, researched_at: new Date().toISOString() },
      fit_score: fit,
      trade: prospect.trade ?? (typeof result.industry === 'string' ? result.industry.slice(0, 80) : null),
      status: 'researched',
    })
    .eq('id', prospectId)

  return { prospect_id: prospectId, research: { ...result, fit_score: fit } }
}

async function runDraft(db: Db, prospectId: string) {
  const { data: prospect, error } = await db.from('prospects').select('*').eq('id', prospectId).single()
  if (error || !prospect) throw new Error('prospect_not_found')

  const research = (prospect.research ?? {}) as Record<string, unknown>
  const result = await generateJson<{ messages: Array<{ step: number; subject: string; body: string }> }>(
    [
      `Prospect company: ${prospect.company}`,
      `Contact first name: ${(prospect.contact_name ?? '').split(' ')[0] || 'there'}`,
      `Website: ${prospect.website ?? 'unknown'}`,
      `Region: ${prospect.region ?? 'Czech Republic'}`,
      `Research summary: ${research.summary ?? 'none'}`,
      `Observed signals: ${JSON.stringify(research.signals ?? [])}`,
      `Likely pain points: ${JSON.stringify(research.pain_points ?? [])}`,
      `Personalisation hooks: ${JSON.stringify(research.hooks ?? [])}`,
      `Recommended offer: ${research.recommended_offer ?? 'localised website with AI lead capture'}`,
      `Useful links: ${SITE}/calculator (instant price), ${SITE}/case-studies, ${SITE}/offer, ${SITE}/grant-eligibility (Kreativní vouchery guidance).`,
    ].join('\n'),
    {
      instructions: [
        'Write a three-step cold email sequence for FastMedia.Pro in British English only.',
        'Step 1 is the opener: under 130 words, one verifiable personalised observation, one clear single ask (a 15-minute call or a link).',
        'Step 2 (gentle nudge, under 80 words) and step 3 (final, under 60 words, polite close-out) must reference the opener without repeating it.',
        'Plain text bodies, no markdown, no bullet symbols, no images. Sign off as "Tim Knott, FastMedia.Pro".',
        'Never invent client names, figures, awards, grant guarantees or government supplier status. Grants may be described only as guidance we help prepare, never as approved funding.',
        'Subjects: under 60 characters, lower-case-ish, no spam words, no exclamation marks.',
        'Do not add an unsubscribe footer; the system appends one.',
      ].join(' '),
      schema: SEQUENCE_SCHEMA,
      schemaName: 'outreach_sequence',
      effort: 'medium',
    },
  )

  const messages = (result.messages ?? []).slice(0, 3)
  if (messages.length === 0) throw new Error('ai_returned_no_messages')

  for (const [index, message] of messages.entries()) {
    const step = index + 1
    await db.from('outreach_messages').upsert(
      {
        prospect_id: prospectId,
        step,
        subject: String(message.subject ?? '').slice(0, 200),
        body: String(message.body ?? '').slice(0, 6000),
        language: 'en',
        status: 'draft',
        scheduled_at: null,
        error_message: null,
      },
      { onConflict: 'prospect_id,step' },
    )
  }

  await db.from('prospects').update({ status: 'drafted' }).eq('id', prospectId)
  return { prospect_id: prospectId, steps: messages.length }
}

async function sendMessage(db: Db, prospect: Record<string, any>, message: Record<string, any>) {
  if (!gmailFallbackAvailable()) {
    await db
      .from('outreach_messages')
      .update({ status: 'failed', error_message: 'google_mail_not_connected' })
      .eq('id', message.id)
    return { sent: false, reason: 'google_mail_not_connected' }
  }

  const { data: suppressed } = await db
    .from('suppressed_emails')
    .select('id')
    .eq('email', String(prospect.email).toLowerCase())
    .maybeSingle()
  if (suppressed) {
    await db.from('outreach_messages').update({ status: 'skipped', error_message: 'suppressed' }).eq('id', message.id)
    await db.from('prospects').update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('id', prospect.id)
    return { sent: false, reason: 'suppressed' }
  }

  const html = htmlFromText(message.body, footerFor(message.language ?? 'en'))
  const result = await sendViaGmail(prospect.email, message.subject, html, message.body)
  const now = new Date().toISOString()

  await db
    .from('outreach_messages')
    .update(
      result.sent
        ? { status: 'sent', sent_at: now, provider_message_id: result.id ?? null, error_message: null }
        : { status: 'failed', error_message: result.error ?? 'send_failed' },
    )
    .eq('id', message.id)

  await db.from('email_send_log').insert({
    message_id: result.id ?? null,
    template_name: `outreach-step-${message.step}`,
    recipient_email: prospect.email,
    status: result.sent ? 'sent' : 'failed',
    error_message: result.sent ? null : result.error ?? null,
    metadata: { via: 'google_workspace', prospect_id: prospect.id, step: message.step },
  })

  if (result.sent) {
    await db.from('prospects').update({ last_contacted_at: now }).eq('id', prospect.id)
  }
  return { sent: result.sent, reason: result.error }
}

async function runApprove(db: Db, prospectId: string, approvedBy: string | null) {
  const { data: prospect, error } = await db.from('prospects').select('*').eq('id', prospectId).single()
  if (error || !prospect) throw new Error('prospect_not_found')
  if (prospect.unsubscribed_at) throw new Error('prospect_unsubscribed')

  const { data: messages } = await db
    .from('outreach_messages')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('step')
  const steps = messages ?? []
  const opener = steps.find((m) => m.step === 1)
  if (!opener) throw new Error('no_opener_draft')

  const now = new Date()
  await db
    .from('outreach_messages')
    .update({ status: 'approved', approved_by: approvedBy, approved_at: now.toISOString() })
    .eq('id', opener.id)

  const send = await sendMessage(db, prospect, { ...opener, status: 'approved' })

  // Follow-ups become autonomous only once the opener is approved.
  for (const [index, followUp] of steps.filter((m) => m.step > 1).entries()) {
    const due = new Date(now.getTime() + (FOLLOW_UP_DAYS[index] ?? 14) * 86400000)
    await db
      .from('outreach_messages')
      .update({
        status: 'scheduled',
        scheduled_at: due.toISOString(),
        approved_by: approvedBy,
        approved_at: now.toISOString(),
        error_message: null,
      })
      .eq('id', followUp.id)
  }

  await db.from('prospects').update({ status: send.sent ? 'sequencing' : 'approved' }).eq('id', prospectId)
  return { prospect_id: prospectId, opener_sent: send.sent, reason: send.reason ?? null, scheduled: Math.max(0, steps.length - 1) }
}

async function detectReplies(db: Db) {
  const { data: active } = await db
    .from('prospects')
    .select('id, email')
    .in('status', ['sequencing', 'approved'])
    .is('replied_at', null)
  let replied = 0
  for (const prospect of active ?? []) {
    const { data: inbound } = await db
      .from('inbound_emails')
      .select('id, subject, body_plain, created_at')
      .ilike('from_address', `%${prospect.email}%`)
      .order('created_at', { ascending: false })
      .limit(1)
    const hit = inbound?.[0]
    if (!hit) continue
    const stop = /\bstop\b|unsubscribe|odhlásit|nezasílejte/i.test(
      `${hit.subject ?? ''} ${hit.body_plain ?? ''}`.slice(0, 2000),
    )
    await db
      .from('prospects')
      .update({
        replied_at: hit.created_at,
        status: stop ? 'unsubscribed' : 'replied',
        ...(stop ? { unsubscribed_at: new Date().toISOString() } : {}),
      })
      .eq('id', prospect.id)
    await db
      .from('outreach_messages')
      .update({ status: 'cancelled' })
      .eq('prospect_id', prospect.id)
      .eq('status', 'scheduled')
    if (stop) {
      await db.from('suppressed_emails').insert({
        email: prospect.email.toLowerCase(),
        reason: 'unsubscribe',
        metadata: { source: 'outreach_reply' },
      })
    }
    replied += 1
  }
  return replied
}

async function sendDueFollowUps(db: Db) {
  const { data: due } = await db
    .from('outreach_messages')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(25)

  let sent = 0
  for (const message of due ?? []) {
    const { data: prospect } = await db.from('prospects').select('*').eq('id', message.prospect_id).single()
    if (!prospect) continue
    if (prospect.replied_at || prospect.unsubscribed_at || !['sequencing', 'approved'].includes(prospect.status)) {
      await db.from('outreach_messages').update({ status: 'cancelled' }).eq('id', message.id)
      continue
    }
    const result = await sendMessage(db, prospect, message)
    if (result.sent) sent += 1
  }
  return sent
}

async function recoverAbandonedForms(db: Db) {
  const cutoff = new Date(Date.now() - 45 * 60000).toISOString()
  const { data: pending } = await db
    .from('visitor_signals')
    .select('*')
    .eq('recovery_status', 'pending')
    .not('email', 'is', null)
    .lte('created_at', cutoff)
    .limit(20)

  let recovered = 0
  for (const signal of pending ?? []) {
    const cs = signal.language === 'cs'
    const subject = cs ? 'Dokončíme váš odhad?' : 'Shall we finish your estimate?'
    const body = cs
      ? `Dobrý den${signal.name ? ` ${signal.name}` : ''},\n\nvšimli jsme si, že jste u nás začali vyplňovat formulář a nedokončili ho. Pokud chcete, dokončíme to za vás — stačí odpovědět na tento e-mail.\n\nOrientační cenu si můžete spočítat tady: ${SITE}/calculator\nNaše případové studie: ${SITE}/case-studies\n\nS přáním pěkného dne,\nTim Knott, FastMedia.Pro`
      : `Hello${signal.name ? ` ${signal.name}` : ''},\n\nI noticed you started a form on our site and did not finish it. If it is easier, reply to this email and I will finish it for you.\n\nInstant price guide: ${SITE}/calculator\nRecent work: ${SITE}/case-studies\n\nKind regards,\nTim Knott, FastMedia.Pro`

    if (!gmailFallbackAvailable()) break
    const result = await sendViaGmail(signal.email, subject, htmlFromText(body, footerFor(signal.language)), body)
    await db
      .from('visitor_signals')
      .update({
        recovery_status: result.sent ? 'emailed' : 'failed',
        recovered_at: result.sent ? new Date().toISOString() : null,
      })
      .eq('id', signal.id)
    if (result.sent) recovered += 1
  }
  return recovered
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    const body = await req.json().catch(() => ({}))
    const action = typeof body?.action === 'string' ? body.action : 'tick'
    const prospectId = typeof body?.prospect_id === 'string' ? body.prospect_id : null
    const approvedBy = typeof body?.approved_by === 'string' ? body.approved_by : null

    if (action === 'research') {
      if (!prospectId) return json({ error: 'prospect_id_required' }, 400)
      return json(await runResearch(db, prospectId))
    }
    if (action === 'draft') {
      if (!prospectId) return json({ error: 'prospect_id_required' }, 400)
      return json(await runDraft(db, prospectId))
    }
    if (action === 'approve') {
      if (!prospectId) return json({ error: 'prospect_id_required' }, 400)
      return json(await runApprove(db, prospectId, approvedBy))
    }
    if (action === 'tick') {
      const replies = await detectReplies(db)
      const followUps = await sendDueFollowUps(db)
      const recovered = await recoverAbandonedForms(db)
      return json({ ok: true, replies, follow_ups_sent: followUps, forms_recovered: recovered })
    }
    return json({ error: 'unknown_action' }, 400)
  } catch (error) {
    console.error('outreach-agent failed:', error)
    return json({ error: 'agent_failed', details: String(error) }, 500)
  }
})

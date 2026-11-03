// Outbound prospecting + customer communication agent.
//
// Actions (admin-gated):
//   research         - build a prospect profile from their public website + AI analysis
//   draft            - write a personalised 3-step British-English email sequence
//   approve          - approve and send the opener; queue follow-ups for their own approval
//   approve_message  - per-message gate: edit copy/timing, then schedule or send that message
//   reject_message   - reject a drafted/queued message (never sends)
//   cancel_message   - cancel an approved-but-unsent message
//   suppress         - stop all contact with a prospect and suppress their address
//   simulate_visitor - create an anonymous practice visitor signal (test mode)
//   discover         - find real businesses for a trade + region and queue them for review
//   discover_weekly  - cron: rotate through the configured trades/regions and discover leads
//   tick             - cron: reply detection, due follow-ups, abandoned-form recovery
//
// Nothing is ever sent without a human approving that exact message.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'
import { gmailFallbackAvailable, sendViaGmail } from '../_shared/gmail-fallback.ts'
import { generateJson } from '../_shared/ai-json.ts'
import { canSendNow, clampPacing, nextGapMinutes, pragueParts, type PacingSettings } from '../_shared/send-pacing.ts'
import { htmlToPlainText, sanitizeEmailHtml } from '../_shared/email-html.ts'
import { suppressionGate } from '../_shared/suppression-gate.ts'
import { checkMarketingEligibility } from '../_shared/legal-eligibility.ts'
import { marketingFooter, unsubscribeUrlFor } from '../_shared/marketing-footer.ts'

const REPLY_TO = Deno.env.get('OUTREACH_REPLY_TO') ?? 'support@fastmedia.pro'
const SITE = 'https://www.fastmedia.pro'

type Db = ReturnType<typeof createClient>

interface Actor {
  id: string | null
  label: string
  type: 'staff' | 'system'
}

interface Settings {
  test_mode: boolean
  test_inbox: string | null
  simulate_visitors: boolean
  follow_up_days_step2: number
  follow_up_days_step3: number
  discovery_enabled: boolean
  discovery_trades: string[]
  discovery_regions: string[]
  discovery_cursor: number
  discovery_spend_date: string | null
  discovery_spend_credits: number
  pacing: PacingSettings
  next_send_at: string | null
}

/** Hard daily cap on AI credits spent by lead discovery (user request: free-tier sized). */
const DISCOVERY_DAILY_CREDIT_CAP = 5
/** Conservative estimate of credits used by one web-search discovery call. */
const DISCOVERY_CREDITS_PER_SEARCH = 1.5

const DEFAULT_SETTINGS: Settings = {
  test_mode: false,
  test_inbox: REPLY_TO,
  simulate_visitors: false,
  follow_up_days_step2: 4,
  follow_up_days_step3: 9,
  discovery_enabled: true,
  discovery_trades: ['plumber', 'electrician', 'hair salon', 'dental clinic', 'restaurant', 'carpenter', 'fitness studio', 'accountant'],
  discovery_regions: ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Ústí nad Labem', 'Liberec', 'Olomouc', 'České Budějovice'],
  discovery_cursor: 0,
  discovery_spend_date: null,
  discovery_spend_credits: 0,
  pacing: clampPacing({}),
  next_send_at: null,
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

async function loadSettings(db: Db): Promise<Settings> {
  const { data, error } = await db.from('outreach_settings').select('*').eq('id', 1).maybeSingle()
  if (error || !data) throw new Error('pacing_settings_unavailable')
  return {
    test_mode: !!data.test_mode,
    test_inbox: data.test_inbox || REPLY_TO,
    simulate_visitors: !!data.simulate_visitors,
    follow_up_days_step2: Number(data.follow_up_days_step2) || 4,
    follow_up_days_step3: Number(data.follow_up_days_step3) || 9,
    discovery_enabled: data.discovery_enabled !== false,
    discovery_trades: Array.isArray(data.discovery_trades) && data.discovery_trades.length > 0 ? data.discovery_trades : DEFAULT_SETTINGS.discovery_trades,
    discovery_regions: Array.isArray(data.discovery_regions) && data.discovery_regions.length > 0 ? data.discovery_regions : DEFAULT_SETTINGS.discovery_regions,
    discovery_cursor: Number(data.discovery_cursor) || 0,
    discovery_spend_date: data.discovery_spend_date ?? null,
    discovery_spend_credits: Number(data.discovery_spend_credits) || 0,
    pacing: clampPacing({
      dailyCap: data.send_daily_cap,
      hourlyCap: data.send_hourly_cap,
      minGapMinutes: data.send_min_gap_minutes,
      maxGapMinutes: data.send_max_gap_minutes,
      windowStartMinute: data.send_window_start_minute,
      windowEndMinute: data.send_window_end_minute,
      weekdaysOnly: data.send_weekdays_only,
    }),
    next_send_at: data.next_send_at ?? null,
  }
}

async function resolveActor(req: Request): Promise<Actor> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!bearer || !url || !anon || bearer === service) return { id: null, label: 'automation', type: 'system' }
  try {
    const client = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${bearer}` } } })
    const { data } = await client.auth.getUser()
    if (!data?.user) return { id: null, label: 'automation', type: 'system' }
    return { id: data.user.id, label: data.user.email ?? data.user.id, type: 'staff' }
  } catch {
    return { id: null, label: 'automation', type: 'system' }
  }
}

async function logEvent(
  db: Db,
  actor: Actor,
  action: string,
  opts: { prospectId?: string | null; messageId?: string | null; step?: number | null; details?: Record<string, unknown> },
) {
  await db.from('outreach_events').insert({
    prospect_id: opts.prospectId ?? null,
    message_id: opts.messageId ?? null,
    step: opts.step ?? null,
    action,
    actor_type: actor.type,
    actor_id: actor.id,
    actor_label: actor.label,
    details: opts.details ?? {},
  })
}

function htmlFromText(body: string, footer: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br/>').replace(/</g, '&lt;')}</p>`)
    .join('')
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1c1c1c">${paragraphs}<p style="margin:22px 0 0;font-size:12px;color:#6b7280">${footer}</p></div>`
}

function emailShell(inner: string, notice: string, footer: string) {
  const noticeHtml = notice ? `<p style="margin:14px 0 0;font-size:12px;color:#6b7280">${notice.replace(/</g, '&lt;').trim()}</p>` : ''
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1c1c1c;max-width:600px">${inner}${noticeHtml}<p style="margin:22px 0 0;font-size:12px;color:#6b7280">${footer}</p></div>`
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

async function runResearch(db: Db, actor: Actor, prospectId: string) {
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

  await logEvent(db, actor, 'researched', { prospectId, details: { fit_score: fit } })
  return { prospect_id: prospectId, research: { ...result, fit_score: fit } }
}

async function runDraft(db: Db, actor: Actor, prospectId: string) {
  const { data: prospect, error } = await db.from('prospects').select('*').eq('id', prospectId).single()
  if (error || !prospect) throw new Error('prospect_not_found')

  const settings = await loadSettings(db)
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

  const dayOffsets = [0, settings.follow_up_days_step2, settings.follow_up_days_step3]
  for (const [index, message] of messages.entries()) {
    const step = index + 1
    const proposed =
      step === 1 ? null : new Date(Date.now() + (dayOffsets[index] ?? 14) * 86400000).toISOString()
    await db.from('outreach_messages').upsert(
      {
        prospect_id: prospectId,
        step,
        subject: String(message.subject ?? '').slice(0, 200),
        body: String(message.body ?? '').slice(0, 6000),
        language: 'en',
        status: 'draft',
        proposed_at: proposed,
        scheduled_at: null,
        error_message: null,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
        cancelled_at: null,
        cancelled_by: null,
      },
      { onConflict: 'prospect_id,step' },
    )
  }

  await db.from('prospects').update({ status: 'drafted' }).eq('id', prospectId)
  await logEvent(db, actor, 'drafted', { prospectId, details: { steps: messages.length } })
  return { prospect_id: prospectId, steps: messages.length }
}

async function sendMessage(
  db: Db,
  actor: Actor,
  prospect: Record<string, any>,
  message: Record<string, any>,
  settings: Settings,
) {
  if (!gmailFallbackAvailable()) {
    await db
      .from('outreach_messages')
      .update({ status: 'failed', error_message: 'google_mail_not_connected' })
      .eq('id', message.id)
    await logEvent(db, actor, 'send_failed', {
      prospectId: prospect.id,
      messageId: message.id,
      step: message.step,
      details: { reason: 'google_mail_not_connected' },
    })
    return { sent: false, reason: 'google_mail_not_connected' }
  }

  const testMode = settings.test_mode
  const recipient = testMode ? settings.test_inbox || REPLY_TO : prospect.email

  if (!testMode) {
    const { data: suppressed, error: suppressionError } = await db
      .from('suppressed_emails')
      .select('id')
      .eq('email', String(prospect.email).trim().toLowerCase())
      .maybeSingle()
    const gate = suppressionGate(!!suppressed, !!suppressionError)
    if (suppressionError) return { sent: false, reason: gate.reason ?? 'suppression_check_failed' }
    if (suppressed) {
      await db.from('outreach_messages').update({ status: 'skipped', error_message: 'suppressed' }).eq('id', message.id)
      await db
        .from('prospects')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
        .eq('id', prospect.id)
      await logEvent(db, actor, 'skipped_suppressed', {
        prospectId: prospect.id,
        messageId: message.id,
        step: message.step,
      })
      return { sent: false, reason: 'suppressed' }
    }
  }

  const subject = testMode ? `[TEST → ${prospect.email}] ${message.subject}` : message.subject
  const notice = testMode
    ? `\n\n---\nTest mode: this message was routed to the test inbox instead of ${prospect.email}.`
    : ''
  let footerHtml = footerFor(message.language ?? 'en')
  let footerText = footerHtml
  let headers: Record<string, string> = {}
  if (!testMode) {
    let url: string
    try { url = await unsubscribeUrlFor(db, prospect.email) } catch (e) {
      await db.from('outreach_messages').update({ status: 'skipped', error_message: `legal_block: ${(e as Error).message}` }).eq('id', message.id)
      return { sent: false, reason: 'legal_block', reasons: [(e as Error).message] }
    }
    const f = marketingFooter(message.language ?? 'en', url)
    footerHtml = f.html; footerText = f.text; headers = f.headers
  }
  const bodyText = `${message.body}${notice}\n\n${footerText}`
  const inner = message.body_html ? sanitizeEmailHtml(message.body_html) : null
  const html = inner ? emailShell(inner, notice, '%%FOOTER%%') : htmlFromText(`${message.body}${notice}`, '%%FOOTER%%')
  const finalHtml = html.replace('%%FOOTER%%', footerHtml)
  if (!testMode) {
    // Final gate on the exact rendered message, immediately before dispatch.
    const legal = await checkMarketingEligibility(db, prospect.email, { html: finalHtml, text: bodyText })
    if (!legal.allowed) {
      await db.from('outreach_messages').update({ status: 'skipped', error_message: `legal_block: ${legal.reasons.join(' | ')}`.slice(0, 1000) }).eq('id', message.id)
      await logEvent(db, actor, 'skipped_legal', { prospectId: prospect.id, messageId: message.id, step: message.step, details: { reasons: legal.reasons } })
      return { sent: false, reason: 'legal_block', reasons: legal.reasons }
    }
  }
  const result = await sendViaGmail(recipient, subject, finalHtml, bodyText, headers)
  const now = new Date().toISOString()

  await db
    .from('outreach_messages')
    .update(
      result.sent
        ? {
            status: 'sent',
            sent_at: now,
            provider_message_id: result.id ?? null,
            error_message: null,
            test_mode: testMode,
            delivered_to: recipient,
          }
        : { status: 'failed', error_message: result.error ?? 'send_failed', test_mode: testMode },
    )
    .eq('id', message.id)

  await db.from('email_send_log').insert({
    message_id: result.id ?? null,
    template_name: `outreach-step-${message.step}`,
    recipient_email: recipient,
    status: result.sent ? 'sent' : 'failed',
    error_message: result.sent ? null : result.error ?? null,
    metadata: { via: 'google_workspace', prospect_id: prospect.id, step: message.step, test_mode: testMode },
  })

  if (result.sent && !testMode) {
    await db.from('prospects').update({ last_contacted_at: now }).eq('id', prospect.id)
  }

  await logEvent(db, actor, result.sent ? 'sent' : 'send_failed', {
    prospectId: prospect.id,
    messageId: message.id,
    step: message.step,
    details: { recipient, test_mode: testMode, ...(result.sent ? {} : { reason: result.error ?? 'send_failed' }) },
  })

  return { sent: result.sent, reason: result.error }
}

/** Approves + sends the opener, then queues the follow-ups for their own approval. */
async function runApprove(db: Db, actor: Actor, prospectId: string) {
  const { data: prospect, error } = await db.from('prospects').select('*').eq('id', prospectId).single()
  if (error || !prospect) throw new Error('prospect_not_found')
  if (prospect.unsubscribed_at) throw new Error('prospect_unsubscribed')
  if (prospect.status === 'suppressed') throw new Error('prospect_suppressed')

  const settings = await loadSettings(db)
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
    .update({ status: 'approved', approved_by: actor.id, approved_at: now.toISOString() })
    .eq('id', opener.id)
  await logEvent(db, actor, 'approved', { prospectId, messageId: opener.id, step: 1 })

  // Opener joins the paced queue: it leaves at the next free slot inside business hours.
  await db
    .from('outreach_messages')
    .update({ status: 'scheduled', scheduled_at: now.toISOString(), proposed_at: now.toISOString(), error_message: null })
    .eq('id', opener.id)
  await logEvent(db, actor, 'queued', { prospectId, messageId: opener.id, step: 1 })
  const send = { sent: false, reason: 'queued' as string | undefined }

  // Follow-ups wait for their own approval — nothing sends automatically.
  const dayOffsets = [settings.follow_up_days_step2, settings.follow_up_days_step3]
  for (const [index, followUp] of steps.filter((m) => m.step > 1).entries()) {
    const proposed = new Date(now.getTime() + (dayOffsets[index] ?? 14) * 86400000)
    await db
      .from('outreach_messages')
      .update({
        status: 'pending_approval',
        proposed_at: proposed.toISOString(),
        scheduled_at: null,
        error_message: null,
      })
      .eq('id', followUp.id)
    await logEvent(db, actor, 'queued_for_approval', {
      prospectId,
      messageId: followUp.id,
      step: followUp.step,
      details: { proposed_at: proposed.toISOString() },
    })
  }

  await db.from('prospects').update({ status: 'sequencing' }).eq('id', prospectId)
  return {
    prospect_id: prospectId,
    queued: true,
    opener_sent: send.sent,
    reason: send.reason ?? null,
    awaiting_approval: Math.max(0, steps.length - 1),
    test_mode: settings.test_mode,
  }
}

/** Per-message gate: edit copy/timing, then schedule it or send it now. */
async function approveMessage(
  db: Db,
  actor: Actor,
  args: { messageId: string; subject?: string; body?: string; bodyHtml?: string; scheduledAt?: string | null; sendNow?: boolean },
) {
  const { data: message, error } = await db.from('outreach_messages').select('*').eq('id', args.messageId).single()
  if (error || !message) throw new Error('message_not_found')
  if (['sent', 'rejected'].includes(message.status)) throw new Error(`message_already_${message.status}`)

  const { data: prospect } = await db.from('prospects').select('*').eq('id', message.prospect_id).single()
  if (!prospect) throw new Error('prospect_not_found')
  if (prospect.unsubscribed_at || prospect.status === 'suppressed') throw new Error('prospect_not_contactable')

  const settings = await loadSettings(db)
  if (!settings.test_mode) {
    const legal = await checkMarketingEligibility(db, prospect.email)
    if (!legal.allowed) throw new Error(`legal_block: ${legal.reasons.join(' | ')}`)
  }
  const now = new Date().toISOString()
  const edits: Record<string, unknown> = {}
  if (typeof args.subject === 'string' && args.subject.trim() && args.subject !== message.subject) {
    edits.subject = args.subject.trim().slice(0, 200)
  }
  if (typeof args.bodyHtml === 'string' && args.bodyHtml.trim()) {
    const clean = sanitizeEmailHtml(args.bodyHtml)
    if (clean !== message.body_html) {
      edits.body_html = clean
      edits.body = htmlToPlainText(clean).slice(0, 6000)
    }
  } else if (typeof args.body === 'string' && args.body.trim() && args.body !== message.body) {
    edits.body = args.body.trim().slice(0, 6000)
    edits.body_html = null
  }
  if (Object.keys(edits).length > 0) {
    await db
      .from('outreach_messages')
      .update({ ...edits, edited_by: actor.id, edited_at: now })
      .eq('id', message.id)
    await logEvent(db, actor, 'edited', {
      prospectId: prospect.id,
      messageId: message.id,
      step: message.step,
      details: { fields: Object.keys(edits) },
    })
  }

  const merged = { ...message, ...edits }

  if (args.sendNow) {
    // "Send now" means "next free slot" — it still respects the daily cap, hours and spacing.
    await db
      .from('outreach_messages')
      .update({ status: 'scheduled', scheduled_at: now, proposed_at: now, approved_by: actor.id, approved_at: now, error_message: null })
      .eq('id', message.id)
    await logEvent(db, actor, 'approved', {
      prospectId: prospect.id,
      messageId: message.id,
      step: message.step,
      details: { queued_next_slot: true },
    })
    if (prospect.status !== 'sequencing') {
      await db.from('prospects').update({ status: 'sequencing' }).eq('id', prospect.id)
    }
    void merged
    return { message_id: message.id, queued: true, sent: false, reason: null, test_mode: settings.test_mode }
  }

  const when = args.scheduledAt || message.proposed_at || new Date(Date.now() + 86400000).toISOString()
  await db
    .from('outreach_messages')
    .update({
      status: 'scheduled',
      scheduled_at: when,
      proposed_at: when,
      approved_by: actor.id,
      approved_at: now,
      error_message: null,
    })
    .eq('id', message.id)
  await logEvent(db, actor, 'approved', {
    prospectId: prospect.id,
    messageId: message.id,
    step: message.step,
    details: { scheduled_at: when },
  })
  if (prospect.status === 'drafted' || prospect.status === 'new') {
    await db.from('prospects').update({ status: 'approved' }).eq('id', prospect.id)
  }
  return { message_id: message.id, scheduled_at: when, test_mode: settings.test_mode }
}

async function rejectMessage(db: Db, actor: Actor, messageId: string, reason: string | null) {
  const { data: message, error } = await db.from('outreach_messages').select('*').eq('id', messageId).single()
  if (error || !message) throw new Error('message_not_found')
  if (message.status === 'sent') throw new Error('message_already_sent')
  await db
    .from('outreach_messages')
    .update({
      status: 'rejected',
      rejected_by: actor.id,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
      scheduled_at: null,
    })
    .eq('id', messageId)
  await logEvent(db, actor, 'rejected', {
    prospectId: message.prospect_id,
    messageId,
    step: message.step,
    details: { reason },
  })
  return { message_id: messageId, status: 'rejected' }
}

async function cancelMessage(db: Db, actor: Actor, messageId: string) {
  const { data: message, error } = await db.from('outreach_messages').select('*').eq('id', messageId).single()
  if (error || !message) throw new Error('message_not_found')
  if (message.status === 'sent') throw new Error('message_already_sent')
  await db
    .from('outreach_messages')
    .update({ status: 'cancelled', cancelled_by: actor.id, cancelled_at: new Date().toISOString(), scheduled_at: null })
    .eq('id', messageId)
  await logEvent(db, actor, 'cancelled', { prospectId: message.prospect_id, messageId, step: message.step })
  return { message_id: messageId, status: 'cancelled' }
}

async function suppressProspect(db: Db, actor: Actor, prospectId: string, reason: string | null) {
  const { data: prospect, error } = await db.from('prospects').select('*').eq('id', prospectId).single()
  if (error || !prospect) throw new Error('prospect_not_found')

  await db
    .from('outreach_messages')
    .update({ status: 'cancelled', cancelled_by: actor.id, cancelled_at: new Date().toISOString(), scheduled_at: null })
    .eq('prospect_id', prospectId)
    .in('status', ['draft', 'pending_approval', 'approved', 'scheduled'])

  await db
    .from('prospects')
    .update({ status: 'suppressed', unsubscribed_at: new Date().toISOString() })
    .eq('id', prospectId)

  const email = String(prospect.email).toLowerCase()
  const { data: existing } = await db.from('suppressed_emails').select('id').eq('email', email).maybeSingle()
  if (!existing) {
    await db.from('suppressed_emails').insert({
      email,
      reason: 'unsubscribe',
      metadata: { source: 'prospecting_desk', note: reason ?? 'suppressed by staff' },
    })
  }

  await logEvent(db, actor, 'suppressed', { prospectId, details: { reason } })
  return { prospect_id: prospectId, status: 'suppressed' }
}

async function simulateVisitor(
  db: Db,
  actor: Actor,
  args: { kind?: string; pagePath?: string; language?: string; formId?: string | null },
) {
  const kind = ['exit_intent', 'form_abandoned', 'high_value'].includes(args.kind ?? '')
    ? (args.kind as string)
    : 'form_abandoned'
  const row = {
    session_key: `sim-${crypto.randomUUID()}`,
    kind,
    page_path: args.pagePath || '/calculator',
    form_id: args.formId ?? 'simulation',
    language: args.language === 'cs' ? 'cs' : 'en',
    // Simulations never collect real contact details.
    name: null,
    email: null,
    phone: null,
    payload: { simulated: true, qualification: kind === 'high_value' ? 'qualified' : 'partial' },
    recovery_status: 'skipped',
    simulated: true,
  }
  const { data, error } = await db.from('visitor_signals').insert(row).select('id').single()
  if (error) throw new Error(error.message)
  await logEvent(db, actor, 'simulated_visitor', { details: { kind, page_path: row.page_path } })
  return { id: data.id, kind, simulated: true }
}

async function detectReplies(db: Db, actor: Actor) {
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
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('prospect_id', prospect.id)
      .in('status', ['pending_approval', 'approved', 'scheduled'])
    if (stop) {
      const { data: existing } = await db
        .from('suppressed_emails')
        .select('id')
        .eq('email', prospect.email.toLowerCase())
        .maybeSingle()
      if (!existing) {
        await db.from('suppressed_emails').insert({
          email: prospect.email.toLowerCase(),
          reason: 'unsubscribe',
          metadata: { source: 'outreach_reply' },
        })
      }
    }
    await logEvent(db, actor, stop ? 'unsubscribed' : 'replied', { prospectId: prospect.id })
    replied += 1
  }
  return replied
}

/** Only messages a human individually approved and scheduled are sent here. */
async function pacingCounts(db: Db, now: Date) {
  const since = new Date(now.getTime() - 26 * 3600000).toISOString()
  const { data, error } = await db
    .from('outreach_messages')
    .select('sent_at')
    .eq('status', 'sent')
    .eq('test_mode', false)
    .gte('sent_at', since)
  if (error) throw new Error('pacing_counts_unavailable')
  const today = pragueParts(now).dayKey
  const hourAgo = now.getTime() - 3600000
  let sentToday = 0
  let sentLastHour = 0
  for (const row of data ?? []) {
    const t = new Date(row.sent_at as string)
    if (pragueParts(t).dayKey === today) sentToday += 1
    if (t.getTime() >= hourAgo) sentLastHour += 1
  }
  return { sentToday, sentLastHour }
}

/** Sends at most ONE approved email per call, only when the pacing rules allow it. */
async function sendDueFollowUps(db: Db, actor: Actor, settings: Settings) {
  const token = crypto.randomUUID()
  const { data: acquired, error: leaseError } = await db.rpc('outreach_acquire_worker', { _token: token })
  if (leaseError) throw new Error('queue_lock_unavailable')
  if (!acquired) return 0
  try {
    // Reload inside the shared lease: concurrent approval/cron callers cannot use stale caps or gap.
    return await dispatchDueMessage(db, actor, await loadSettings(db))
  } finally {
    await db.rpc('outreach_release_worker', { _token: token })
  }
}

async function dispatchDueMessage(db: Db, actor: Actor, settings: Settings) {
  const now = new Date()
  if (!settings.test_mode) {
    const counts = await pacingCounts(db, now)
    const decision = canSendNow(now, settings.pacing, counts, settings.next_send_at ? new Date(settings.next_send_at) : null)
    if (!decision.send) return 0
  }
  const { data: due } = await db
    .from('outreach_messages')
    .select('*')
    .eq('status', 'scheduled')
    .not('approved_at', 'is', null)
    .is('dispatch_claimed_at', null)
    .lte('scheduled_at', now.toISOString())
    .order('scheduled_at')
    .limit(5)

  let sent = 0
  for (const message of due ?? []) {
    if (sent >= 1) break
    const { data: prospect } = await db.from('prospects').select('*').eq('id', message.prospect_id).single()
    if (!prospect) continue
    if (
      prospect.replied_at ||
      prospect.unsubscribed_at ||
      !['sequencing', 'approved'].includes(prospect.status)
    ) {
      await db
        .from('outreach_messages')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', message.id)
      await logEvent(db, actor, 'cancelled', {
        prospectId: prospect.id,
        messageId: message.id,
        step: message.step,
        details: { reason: 'prospect_no_longer_contactable' },
      })
      continue
    }
    // Claim before provider dispatch. An uncertain/crashed request is never retried automatically.
    const { data: claimed, error: claimError } = await db.from('outreach_messages')
      .update({ dispatch_claimed_at: new Date().toISOString() })
      .eq('id', message.id).eq('status', 'scheduled').is('dispatch_claimed_at', null)
      .select('id').maybeSingle()
    if (claimError) throw new Error('dispatch_claim_failed')
    if (!claimed) continue
    const gap = nextGapMinutes(settings.pacing)
    const { error: reserveError } = await db.from('outreach_settings')
      .update({ next_send_at: new Date(Date.now() + gap * 60000).toISOString() }).eq('id', 1)
    if (reserveError) throw new Error('pacing_reservation_failed')
    const result = await sendMessage(db, actor, prospect, message, settings)
    if (result.sent) {
      sent += 1
      await db
        .from('outreach_settings')
        .update({ next_send_at: new Date(Date.now() + gap * 60000).toISOString() })
        .eq('id', 1)
    } else {
      // Keep the reserved gap even for failed attempts; never burst through the queue.
      break
    }
  }
  return sent
}

async function recoverAbandonedForms(db: Db, actor: Actor, settings: Settings) {
  const cutoff = new Date(Date.now() - 45 * 60000).toISOString()
  const { data: pending } = await db
    .from('visitor_signals')
    .select('*')
    .eq('recovery_status', 'pending')
    .eq('simulated', false)
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
    let recHtml = htmlFromText(body, footerFor(signal.language))
    let recText = body
    let recHeaders: Record<string, string> = {}
    if (!settings.test_mode) {
      // Recovery mail is promotional: same legal gate as campaigns, on the final rendered message.
      let legal: { allowed: boolean; reasons: string[] }
      try {
        const f = marketingFooter(signal.language, await unsubscribeUrlFor(db, signal.email))
        recHtml = htmlFromText(body, '%%FOOTER%%').replace('%%FOOTER%%', f.html)
        recText = `${body}\n\n${f.text}`
        recHeaders = f.headers
        legal = await checkMarketingEligibility(db, signal.email, { html: recHtml, text: recText })
      } catch (e) { legal = { allowed: false, reasons: [(e as Error).message] } }
      if (!legal.allowed) {
        await db.from('visitor_signals').update({ recovery_status: 'skipped' }).eq('id', signal.id)
        await logEvent(db, actor, 'skipped_legal', { details: { signalId: signal.id, reasons: legal.reasons } })
        continue
      }
    }
    const recipient = settings.test_mode ? settings.test_inbox || REPLY_TO : signal.email
    const finalSubject = settings.test_mode ? `[TEST → ${signal.email}] ${subject}` : subject
    const result = await sendViaGmail(recipient, finalSubject, recHtml, recText, recHeaders)
    await db
      .from('visitor_signals')
      .update({
        recovery_status: result.sent ? 'emailed' : 'failed',
        recovered_at: result.sent ? new Date().toISOString() : null,
      })
      .eq('id', signal.id)
    if (result.sent) {
      recovered += 1
      await logEvent(db, actor, 'form_recovery_sent', {
        details: { recipient, page_path: signal.page_path, test_mode: settings.test_mode },
      })
    }
  }
  return recovered
}

// ---- Lead discovery -------------------------------------------------------

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const JUNK_EMAIL_RE = /example\.|sentry|wixpress|@2x|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$|u003e|noreply@|no-reply@/i

interface DiscoveredBusiness {
  company: string
  contact_name: string
  email: string
  phone: string
  trade: string
  summary: string
  website: string
}

/**
 * Finds candidate businesses using the AI gateway's built-in web search.
 * Search engines block datacenter scraping, so the model searches the web
 * itself and returns only what it actually found.
 */
async function searchBusinessesWithAI(trade: string, region: string): Promise<DiscoveredBusiness[]> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) return []
  try {
    const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra',
        tools: [{ type: 'web_search' }],
        reasoning: { effort: 'low' },
        input: [
          `Search the web for real, currently operating "${trade}" businesses in or near ${region}, Czech Republic.`,
          'Find up to 8 of them. For each, report ONLY details that are publicly listed on the business\'s own website or a public directory listing you actually found:',
          'company (trading name), contact_name (a named person only if published, else ""), email (a published business email, else ""), phone (published phone, else ""), website (their own website address, else the directory page you found them on), summary (one factual sentence, under 200 characters).',
          'Never guess or invent an email address, phone number or website. If a business has no published email, set email to "".',
          'Reply with a JSON array only, no commentary: [{"company":"...","contact_name":"...","email":"...","phone":"...","website":"...","summary":"..."}]',
        ].join('\n'),
      }),
    })
    if (res.status === 402 || res.status === 403 || res.status === 429) throw new Error(`gateway_${res.status}`)
    if (!res.ok) return []
    const data = await res.json()
    const text = (data.output ?? [])
      .filter((item: { type?: string }) => item.type === 'message')
      .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
      .filter((part: { type?: string }) => part.type === 'output_text')
      .map((part: { text?: string }) => part.text ?? '')
      .join('')
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row: Record<string, unknown>) => ({
        company: String(row.company ?? '').trim(),
        contact_name: String(row.contact_name ?? '').trim(),
        email: String(row.email ?? '').toLowerCase().trim(),
        phone: String(row.phone ?? '').trim(),
        trade,
        summary: String(row.summary ?? '').trim(),
        website: String(row.website ?? '').trim(),
      }))
      .filter((b: DiscoveredBusiness) => b.company.length > 1)
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('gateway_')) throw e
    return []
  }
}

/** Confirms an email really appears on the business's own website before we keep it. */
async function verifyEmailOnSite(website: string, email: string): Promise<boolean> {
  if (!website || !email) return false
  const text = await fetchSiteText(website)
  if (!text) return false
  const emails = (text.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase())
  return emails.includes(email)
}

/** Finds real businesses for a trade + region and queues the new ones for review. */
async function runDiscovery(db: Db, actor: Actor, trade: string, region: string, maxInsert = 5) {
  const candidates = await searchBusinessesWithAI(trade, region)

  const found: DiscoveredBusiness[] = []
  for (const business of candidates) {
    if (found.length >= maxInsert * 2) break
    if (!business.email || JUNK_EMAIL_RE.test(business.email)) continue
    // Keep the email only when it is verifiably published on the business's own site.
    const verified = await verifyEmailOnSite(business.website, business.email)
    if (!verified) continue
    found.push({
      company: business.company.slice(0, 120),
      contact_name: business.contact_name.slice(0, 120),
      email: business.email,
      phone: business.phone.slice(0, 40),
      trade: business.trade.slice(0, 80),
      summary: business.summary.slice(0, 300),
      website: business.website.slice(0, 200),
    })
  }

  let inserted = 0
  let duplicates = 0
  for (const business of found) {
    const { data: existing } = await db.from('prospects').select('id').eq('email', business.email).maybeSingle()
    const { data: suppressed } = await db.from('suppressed_emails').select('id').eq('email', business.email).maybeSingle()
    const host = (() => { try { return new URL(business.website).hostname.replace(/^www\./, '') } catch { return '' } })()
    const isDirectory = /firmy\.cz|mapy\.cz|google\.|facebook\.com|zlatestranky/i.test(host)
    const { data: sameSite } = host && !isDirectory
      ? await db.from('prospects').select('id').ilike('website', `%${host}%`).limit(1).maybeSingle()
      : { data: null }
    const { data: sameName } = await db.from('prospects').select('id').ilike('company', business.company).limit(1).maybeSingle()
    if (existing || suppressed || sameSite || sameName) {
      duplicates += 1
      continue
    }
    const { error } = await db.from('prospects').insert({
      company: business.company,
      contact_name: business.contact_name || null,
      email: business.email,
      phone: business.phone || null,
      website: business.website,
      region,
      trade: business.trade,
      language: 'cs',
      source: 'discovery',
      discovered_query: `${trade} — ${region}`,
      notes: business.summary || null,
      status: 'new',
    })
    if (error) duplicates += 1
    else inserted += 1
    if (inserted >= maxInsert) break
  }

  await logEvent(db, actor, 'discovered', {
    details: { trade, region, candidates: candidates.length, verified: found.length, inserted, duplicates },
  })
  return { trade, region, candidates: candidates.length, verified: found.length, inserted, duplicates }
}

/** Weekly cron: rotate through the configured trade/region pairs, one pair per run. */
async function runWeeklyDiscovery(db: Db, actor: Actor) {
  const settings = await loadSettings(db)
  if (!settings.discovery_enabled) return { skipped: true, reason: 'discovery_disabled' }
  const trades = settings.discovery_trades
  const regions = settings.discovery_regions
  // Daily run: trade/region searches, rotating so each day covers new ground.
  // Stops once the day's estimated AI credit spend reaches DISCOVERY_DAILY_CREDIT_CAP.
  const today = new Date().toISOString().slice(0, 10)
  let spentToday = settings.discovery_spend_date === today ? settings.discovery_spend_credits : 0
  if (spentToday >= DISCOVERY_DAILY_CREDIT_CAP) {
    return { skipped: true, reason: 'daily_credit_cap_reached', spent_today: spentToday }
  }
  const results = []
  let cursor = settings.discovery_cursor
  while (spentToday + DISCOVERY_CREDITS_PER_SEARCH <= DISCOVERY_DAILY_CREDIT_CAP) {
    const trade = trades[cursor % trades.length]
    const region = regions[Math.floor(cursor / trades.length) % regions.length]
    cursor += 1
    spentToday += DISCOVERY_CREDITS_PER_SEARCH
    await db.from('outreach_settings').update({
      discovery_cursor: cursor,
      discovery_spend_date: today,
      discovery_spend_credits: spentToday,
    }).eq('id', 1)
    try {
      results.push(await runDiscovery(db, actor, trade, region, 5))
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'error'
      await logEvent(db, actor, 'discovery_paused', { details: { reason, trade, region } })
      results.push({ trade, region, stopped: reason })
      break
    }
  }
  return {
    searches: results,
    inserted: results.reduce((n, r: any) => n + (r.inserted ?? 0), 0),
    spent_today_credits: spentToday,
    daily_credit_cap: DISCOVERY_DAILY_CREDIT_CAP,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // The daily discovery schedule authenticates with a private job token held in the database.
  const jobToken = req.headers.get('x-job-token') ?? ''
  let isDiscoveryJob = false
  if (jobToken) {
    const { data: tok } = await db.from('internal_job_tokens').select('token').eq('name', 'prospect_discovery').maybeSingle()
    isDiscoveryJob = !!tok?.token && tok.token === jobToken
  }
  if (!isDiscoveryJob && !(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)
  const actor = await resolveActor(req)

  try {
    const body = await req.json().catch(() => ({}))
    const action = typeof body?.action === 'string' ? body.action : 'tick'
    const prospectId = typeof body?.prospect_id === 'string' ? body.prospect_id : null
    const messageId = typeof body?.message_id === 'string' ? body.message_id : null
    if (isDiscoveryJob && action !== 'discover_weekly') return unauthorizedResponse(corsHeaders)

    if (action === 'research') {
      if (!prospectId) return json({ error: 'prospect_id_required' }, 400)
      return json(await runResearch(db, actor, prospectId))
    }
    if (action === 'draft') {
      if (!prospectId) return json({ error: 'prospect_id_required' }, 400)
      return json(await runDraft(db, actor, prospectId))
    }
    if (action === 'approve') {
      if (!prospectId) return json({ error: 'prospect_id_required' }, 400)
      return json(await runApprove(db, actor, prospectId))
    }
    if (action === 'approve_message') {
      if (!messageId) return json({ error: 'message_id_required' }, 400)
      return json(
        await approveMessage(db, actor, {
          messageId,
          subject: typeof body?.subject === 'string' ? body.subject : undefined,
          body: typeof body?.body === 'string' ? body.body : undefined,
          bodyHtml: typeof body?.body_html === 'string' ? body.body_html : undefined,
          scheduledAt: typeof body?.scheduled_at === 'string' ? body.scheduled_at : null,
          sendNow: body?.send_now === true,
        }),
      )
    }
    if (action === 'reject_message') {
      if (!messageId) return json({ error: 'message_id_required' }, 400)
      return json(await rejectMessage(db, actor, messageId, typeof body?.reason === 'string' ? body.reason : null))
    }
    if (action === 'cancel_message') {
      if (!messageId) return json({ error: 'message_id_required' }, 400)
      return json(await cancelMessage(db, actor, messageId))
    }
    if (action === 'suppress') {
      if (!prospectId) return json({ error: 'prospect_id_required' }, 400)
      return json(await suppressProspect(db, actor, prospectId, typeof body?.reason === 'string' ? body.reason : null))
    }
    if (action === 'simulate_visitor') {
      return json(
        await simulateVisitor(db, actor, {
          kind: typeof body?.kind === 'string' ? body.kind : undefined,
          pagePath: typeof body?.page_path === 'string' ? body.page_path : undefined,
          language: typeof body?.language === 'string' ? body.language : undefined,
          formId: typeof body?.form_id === 'string' ? body.form_id : null,
        }),
      )
    }
    if (action === 'discover') {
      const trade = typeof body?.trade === 'string' ? body.trade.trim().slice(0, 80) : ''
      const region = typeof body?.region === 'string' ? body.region.trim().slice(0, 80) : ''
      if (!trade || !region) return json({ error: 'trade_and_region_required' }, 400)
      return json(await runDiscovery(db, actor, trade, region))
    }
    if (action === 'discover_weekly') {
      return json(await runWeeklyDiscovery(db, actor))
    }
    if (action === 'drip') {
      const settings = await loadSettings(db)
      return json({ ok: true, sent: await sendDueFollowUps(db, actor, settings), test_mode: settings.test_mode })
    }
    if (action === 'verify_queue') {
      if (!actor.id) return unauthorizedResponse(corsHeaders)
      const userDb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      })
      const { data, error } = await userDb.rpc('outreach_verify_queue')
      if (error) throw new Error(error.message)
      return json({ ok: true, verification: data, sent: 0 })
    }
    if (action === 'queue_status') {
      const settings = await loadSettings(db)
      const counts = await pacingCounts(db, new Date())
      const { count } = await db
        .from('outreach_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date().toISOString())
      return json({ ...counts, waiting: count ?? 0, pacing: settings.pacing, next_send_at: settings.next_send_at })
    }
    if (action === 'tick') {
      const settings = await loadSettings(db)
      const replies = await detectReplies(db, actor)
      const followUps = await sendDueFollowUps(db, actor, settings)
      const recovered = await recoverAbandonedForms(db, actor, settings)
      return json({
        ok: true,
        replies,
        follow_ups_sent: followUps,
        forms_recovered: recovered,
        test_mode: settings.test_mode,
      })
    }
    return json({ error: 'unknown_action' }, 400)
  } catch (error) {
    console.error('outreach-agent failed:', error)
    return json({ error: 'agent_failed', details: String(error) }, 500)
  }
})

// GetSales.io bridge: pushes prospects from the lead review queue into GetSales,
// where a LinkedIn flow picks them up from the chosen contact list.
//
// Actions (admin-gated):
//   ping         - check the saved API key and workspace address answer
//   lists        - GetSales contact lists, so a list can be chosen in the desk
//   flows        - GetSales LinkedIn flows, shown for reference in the desk
//   field_map    - how our prospect fields map onto GetSales contact fields, plus the
//                  values that have no home in GetSales (flagged as unmapped)
//   push         - create/update one prospect as a GetSales contact in that list
//                  (pass dry_run: true to see the mapped payload without sending)
//   retry_failed - re-push every prospect whose last sync failed
//
// Verified against the live GetSales API: contacts are upserted with
// POST /leads/api/leads/upsert { list_uuid, update_if_exists, lead: {...} }.
// GetSales exposes no public endpoint for adding a contact to a flow, so enrolment
// happens through the list the flow watches.
//
// Transient failures (429 / 5xx / network) are retried with backoff. Anything still
// failing is recorded on the prospect so the desk can show it and offer a retry.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const API_KEY = Deno.env.get('GETSALES_API_KEY') ?? ''
const DEFAULT_BASE = 'https://amazing.getsales.io'

/** Our prospect field -> the GetSales contact field it is sent as. */
const FIELD_MAP: { ours: string; theirs: string; note?: string }[] = [
  { ours: 'contact_name', theirs: 'lead.first_name + lead.last_name', note: 'Split on the first space; the company name is used when no contact name is known.' },
  { ours: 'email', theirs: 'lead.email' },
  { ours: 'company', theirs: 'lead.company_name' },
  { ours: 'website', theirs: 'lead.website' },
  { ours: 'linkedin_url', theirs: 'lead.linkedin_id', note: 'Only the profile handle is sent (the part after /in/). Without it GetSales cannot run LinkedIn steps.' },
  { ours: 'phone', theirs: 'lead.phone' },
  { ours: 'trade', theirs: 'lead.position', note: 'Used as the role/industry line on the GetSales contact.' },
  { ours: 'research.summary', theirs: 'lead.note', note: 'The one-line personalisation summary travels with the contact.' },
  { ours: '(settings) GetSales list', theirs: 'list_uuid', note: 'The list your LinkedIn flow watches — this is what starts the sequence.' },
]

/** Fields we hold that the GetSales contact record has nowhere to put. */
const UNMAPPED_FIELDS = [
  { ours: 'id (our prospect reference)', why: 'GetSales has no custom field on the public API, so replies are matched back by email or LinkedIn profile instead.' },
  { ours: 'fit_score', why: 'No numeric scoring field on a GetSales contact; scoring stays in the review queue.' },
  { ours: 'region', why: 'No location field on the contact upsert; GetSales enriches location itself from LinkedIn.' },
  { ours: 'notes', why: 'Only the short personalisation line is sent; the full notes stay here.' },
  { ours: 'research (hooks, signals, pain points)', why: 'Kept here for your approval screen; not sent to GetSales.' },
  { ours: 'language', why: 'Language is chosen by the GetSales flow, not by the contact record.' },
  { ours: 'source / status / approval history', why: 'The review queue owns approval state; GetSales tracks its own sequence state.' },
]

/** Normalises whatever the user typed into an https origin. */
function normaliseBase(raw: string | null | undefined): string {
  const value = (raw ?? '').trim().replace(/\/+$/, '')
  if (!value) return ''
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    return new URL(withScheme).origin
  } catch {
    return ''
  }
}

/** Reduces a LinkedIn profile address to the handle GetSales expects. */
function linkedinHandle(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  const match = value.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/i)
  if (match) return decodeURIComponent(match[1])
  if (/^[A-Za-z0-9\-_%.]+$/.test(value)) return value
  return ''
}

interface GetSalesResult {
  ok: boolean
  status: number
  body: unknown
  attempts: number
  error?: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const isTransient = (status: number) => status === 408 || status === 429 || status >= 500

async function getSales(base: string, path: string, init: RequestInit = {}, maxAttempts = 3): Promise<GetSalesResult> {
  let last: GetSalesResult = { ok: false, status: 0, body: null, attempts: 0, error: 'No attempt was made' }
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${base}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(init.headers ?? {}),
        },
      })
      const text = await response.text()
      let parsed: unknown = text
      try {
        parsed = text ? JSON.parse(text) : null
      } catch {
        /* keep the raw text so provider errors stay readable */
      }
      last = { ok: response.ok, status: response.status, body: parsed, attempts: attempt }
      if (response.ok || !isTransient(response.status)) return last
    } catch (error) {
      last = { ok: false, status: 0, body: null, attempts: attempt, error: String(error).slice(0, 300) }
    }
    if (attempt < maxAttempts) await sleep(attempt * 1200)
  }
  return last
}

/** Turns any GetSales failure into one plain sentence for the back office. */
function describeFailure(result: GetSalesResult): string {
  if (result.status === 401 || result.status === 403) {
    return 'GetSales rejected the API key — create a fresh key in GetSales (Workspace settings, API keys) and save it here again.'
  }
  if (result.status === 404) {
    return 'GetSales could not find that address — check the workspace address in the settings (for example amazing.getsales.io).'
  }
  if (result.status === 429) return 'GetSales is rate limiting us. Try again in a few minutes.'
  if (result.status === 0) return `Could not reach GetSales (${result.error ?? 'network error'}).`
  if (result.status >= 500) return `GetSales had a server problem (${result.status}). Try again shortly.`
  const body = (result.body ?? {}) as Record<string, unknown>
  const nested = (body.error ?? {}) as Record<string, unknown>
  const detail =
    (typeof nested.message === 'string' && nested.message) ||
    (typeof body.message === 'string' && body.message) ||
    (typeof result.body === 'string' ? result.body : JSON.stringify(result.body ?? {}))
  return `GetSales refused the contact (${result.status}): ${String(detail).slice(0, 300)}`
}

const splitName = (full: string | null, fallback: string) => {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first: fallback.slice(0, 60), last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

const rows = (body: unknown): Record<string, unknown>[] => {
  if (Array.isArray(body)) return body as Record<string, unknown>[]
  const data = (body as Record<string, unknown>)?.data
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)

  const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

  let payload: Record<string, unknown> = {}
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Send a JSON body with an action.' }, 400)
  }
  const action = String(payload.action ?? '')

  if (action === 'field_map') return json({ mapped: FIELD_MAP, unmapped: UNMAPPED_FIELDS })
  if (!API_KEY) return json({ error: 'GetSales is not connected yet — the API key is missing.' }, 400)

  const { data: settings } = await db.from('outreach_settings').select('*').eq('id', 1).maybeSingle()
  const base = normaliseBase(settings?.getsales_base_url) || DEFAULT_BASE

  const actor = await (async () => {
    const authHeader = req.headers.get('Authorization') ?? ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const url = Deno.env.get('SUPABASE_URL') ?? ''
    const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    if (!bearer || bearer === (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')) return { id: null, label: 'automation' }
    try {
      const client = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${bearer}` } } })
      const { data } = await client.auth.getUser()
      return { id: data?.user?.id ?? null, label: data?.user?.email ?? 'staff' }
    } catch {
      return { id: null, label: 'staff' }
    }
  })()

  const logEvent = async (name: string, details: Record<string, unknown>, prospectId?: string | null) => {
    await db.from('outreach_events').insert({
      prospect_id: prospectId ?? null,
      action: name,
      actor_id: actor.id,
      actor_type: actor.id ? 'staff' : 'system',
      actor_label: actor.label,
      details,
    })
  }

  /** Statuses that must never be pushed (or re-pushed): the review decision stands. */
  const TERMINAL_STATUSES = ['replied', 'won', 'lost', 'unsubscribed', 'suppressed']

  /** Pushes one prospect; returns a result the caller can report on. */
  const pushProspect = async (
    prospect: Record<string, unknown>,
    overrides: { list_id?: string; linkedin_url?: string } = {},
    dryRun = false,
  ) => {
    const now = new Date().toISOString()
    const attempts = Number(prospect.getsales_sync_attempts ?? 0)

    if (TERMINAL_STATUSES.includes(String(prospect.status))) {
      return {
        ok: false,
        error: `That prospect is marked "${String(prospect.status).replace('_', ' ')}" — its review status was left untouched and nothing was pushed to GetSales.`,
        status: 400,
      }
    }

    const listId = String(overrides.list_id ?? settings?.getsales_list_id ?? '')
    if (!listId) {
      return { ok: false, error: 'Choose a GetSales contact list in the prospecting desk settings first.', status: 400 }
    }

    const linkedinUrl = String(overrides.linkedin_url ?? prospect.linkedin_url ?? '').trim()
    const handle = linkedinHandle(linkedinUrl)
    const { first, last } = splitName(prospect.contact_name as string | null, String(prospect.company))
    const summary = String((prospect.research as Record<string, unknown>)?.summary ?? '')

    const lead: Record<string, unknown> = {
      first_name: first,
      last_name: last || undefined,
      email: prospect.email,
      phone: prospect.phone ?? undefined,
      company_name: prospect.company,
      website: prospect.website ?? undefined,
      linkedin_id: handle || undefined,
      position: prospect.trade ?? undefined,
      note: summary ? summary.slice(0, 500) : undefined,
    }
    const body = { list_uuid: listId, update_if_exists: true, lead }

    const unmappedValues: string[] = []
    if (!handle) unmappedValues.push('LinkedIn profile address is missing — GetSales cannot run LinkedIn steps for this contact')
    if (!prospect.contact_name) unmappedValues.push('No contact name — the company name was used as the first name')
    if (prospect.fit_score) unmappedValues.push(`Fit score ${prospect.fit_score} stays here (GetSales has no scoring field)`)
    if (prospect.region) unmappedValues.push(`Region "${prospect.region}" stays here (no location field on the contact)`)
    if (prospect.notes) unmappedValues.push('Full notes stay here; only the short personalisation line was sent')

    if (dryRun) return { ok: true, dryRun: true, payload: body, unmapped: unmappedValues }

    const upsert = await getSales(base, '/leads/api/leads/upsert', { method: 'POST', body: JSON.stringify(body) })
    if (!upsert.ok) {
      const message = describeFailure(upsert)
      await db
        .from('prospects')
        .update({
          getsales_sync_status: 'failed',
          getsales_sync_error: message,
          getsales_sync_attempts: attempts + upsert.attempts,
          getsales_last_attempt_at: now,
        })
        .eq('id', prospect.id)
      await logEvent('getsales_push_failed', { status: upsert.status, attempts: upsert.attempts, message }, String(prospect.id))
      return { ok: false, error: message, status: upsert.status || 502, retryable: true }
    }

    const created = (upsert.body as Record<string, unknown>) ?? {}
    const createdLead = (created.lead ?? created.data ?? created) as Record<string, unknown>
    const leadId = String(createdLead?.uuid ?? createdLead?.id ?? '')

    await db
      .from('prospects')
      .update({
        getsales_lead_id: leadId || null,
        linkedin_url: linkedinUrl || prospect.linkedin_url,
        getsales_synced_at: now,
        getsales_last_attempt_at: now,
        getsales_sync_attempts: attempts + upsert.attempts,
        getsales_sync_status: 'synced',
        getsales_sync_error: null,
        // Only move the status forward when the prospect has no later review
        // state — never pull a decided lead back into active outreach.
        ...(TERMINAL_STATUSES.includes(String(prospect.status)) ? {} : { status: 'sequencing' }),
      })
      .eq('id', prospect.id)

    await logEvent(
      'getsales_pushed',
      { lead_id: leadId, list_uuid: listId, linkedin_handle: handle || null, unmapped: unmappedValues },
      String(prospect.id),
    )

    // Enrol the pushed contact into the configured LinkedIn flow, so approved
    // leads actually enter the sequence instead of only joining the list.
    // Non-fatal: a missing or wrong flow id must not fail the push itself.
    let enrolled = false
    const flowUuid = String(settings?.getsales_automation_id ?? '').trim()
    if (flowUuid && leadId) {
      const enrol = await getSales(base, `/flows/api/flows/${encodeURIComponent(flowUuid)}/leads/${encodeURIComponent(leadId)}`, { method: 'POST' }, 2)
      enrolled = enrol.ok
      if (enrol.ok) {
        await logEvent('getsales_enrolled', { flow_uuid: flowUuid, lead_id: leadId }, String(prospect.id))
      } else {
        await logEvent(
          'getsales_enrol_failed',
          { flow_uuid: flowUuid, lead_id: leadId, status: enrol.status, message: describeFailure(enrol) },
          String(prospect.id),
        )
      }
    }

    return { ok: true, lead_id: leadId || null, enrolled, unmapped: unmappedValues }
  }


  try {
    if (action === 'webhook_url') {
      const secret = Deno.env.get('GETSALES_WEBHOOK_SECRET') ?? ''
      const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/getsales-webhook?secret=${encodeURIComponent(secret)}`
      return json({ url, configured: Boolean(secret) })
    }

    if (action === 'ping') {
      const result = await getSales(base, '/leads/api/lists?limit=1', {}, 2)
      return json({
        connected: result.ok,
        status: result.status,
        base,
        message: result.ok ? 'GetSales answered with your workspace.' : describeFailure(result),
      })
    }

    if (action === 'lists') {
      const result = await getSales(base, '/leads/api/lists?limit=100')
      if (!result.ok) return json({ error: describeFailure(result), status: result.status }, result.status || 502)
      return json({
        lists: rows(result.body).map((row) => ({
          id: String(row.uuid ?? row.id ?? ''),
          name: String(row.name ?? 'Untitled list'),
        })),
      })
    }

    if (action === 'flows') {
      const result = await getSales(base, '/flows/api/flows?limit=100')
      if (!result.ok) return json({ error: describeFailure(result), status: result.status }, result.status || 502)
      return json({
        flows: rows(result.body).map((row) => ({
          id: String(row.uuid ?? row.id ?? ''),
          name: String(row.name ?? 'Untitled flow'),
          status: String((row as Record<string, unknown>).status ?? ''),
        })),
      })
    }

    if (action === 'flow_detail') {
      const flowUuid = String(payload.flow_uuid ?? '')
      if (!flowUuid) return json({ error: 'flow_uuid is required' }, 400)
      const result = await getSales(base, `/flows/api/flows/${encodeURIComponent(flowUuid)}`)
      return json(result, result.ok ? 200 : 502)
    }

    if (action === 'raw') {
      // Admin-only debug passthrough so the desk can probe undocumented
      // GetSales endpoints. Path must start with a single slash.
      const method = typeof payload.method === 'string' ? payload.method.toUpperCase() : 'GET'
      const rawPath = typeof payload.path === 'string' ? payload.path : ''
      if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) return json({ error: 'Unsupported method' }, 400)
      if (!/^\/[A-Za-z0-9\-._~/?=&{}]+$/.test(rawPath)) return json({ error: 'Invalid path' }, 400)
      const init: RequestInit = { method }
      const rawPayload = payload.payload
      if (rawPayload !== undefined && method !== 'GET') init.body = JSON.stringify(rawPayload)
      const result = await getSales(base, rawPath, init)
      return json(result, result.ok ? 200 : 502)
    }



    if (action === 'push') {
      const prospectId = String(payload.prospect_id ?? '')
      if (!prospectId) return json({ error: 'prospect_id is required' }, 400)
      const { data: prospect } = await db.from('prospects').select('*').eq('id', prospectId).maybeSingle()
      if (!prospect) return json({ error: 'That prospect no longer exists.' }, 404)

      const result = await pushProspect(
        prospect,
        {
          list_id: payload.list_id ? String(payload.list_id) : undefined,
          linkedin_url: payload.linkedin_url ? String(payload.linkedin_url) : undefined,
        },
        payload.dry_run === true,
      )
      if (!result.ok) return json({ error: result.error, retryable: result.retryable ?? false }, result.status ?? 502)
      return json({ success: true, ...result })
    }

    if (action === 'retry_failed') {
      const { data: failed } = await db
        .from('prospects')
        .select('*')
        .eq('getsales_sync_status', 'failed')
        .not(
          'status',
          'in',
          '("suppressed","unsubscribed","replied","won","lost")',
        )
        .limit(25)
      const results: Record<string, unknown>[] = []
      for (const prospect of failed ?? []) {
        const result = await pushProspect(prospect)
        results.push({ prospect_id: prospect.id, company: prospect.company, ok: result.ok, error: result.error ?? null })
      }
      return json({
        attempted: results.length,
        recovered: results.filter((r) => r.ok).length,
        still_failing: results.filter((r) => !r.ok),
      })
    }

    return json({ error: `Unknown action: ${action}` }, 400)
  } catch (error) {
    console.error('getsales-push failed', error)
    return json({ error: String(error).slice(0, 400) }, 500)
  }
})

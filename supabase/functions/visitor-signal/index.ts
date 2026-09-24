// Public endpoint for on-site conversion safeguards: exit intent, abandoned
// forms and high-value visitor alerts. Writes with the service role (the table
// is staff-read-only) and alerts the team for high-value signals.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { gmailFallbackAvailable, sendViaGmail } from '../_shared/gmail-fallback.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALERT_TO = Deno.env.get('OUTREACH_ALERT_EMAIL') ?? 'support@fastmedia.pro'
const KINDS = ['exit_intent', 'form_abandoned', 'high_value']
const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : null)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const raw = await req.json().catch(() => ({}))
    const kind = str(raw?.kind, 40)
    if (!kind || !KINDS.includes(kind)) {
      return new Response(JSON.stringify({ error: 'invalid_kind' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Simulation mode: qualify visitors without storing any real contact details.
    const { data: settings } = await supabase
      .from('outreach_settings')
      .select('simulate_visitors, test_mode')
      .eq('id', 1)
      .maybeSingle()
    const simulate = !!settings?.simulate_visitors

    const email = str(raw?.email, 200)
    const record = {
      kind,
      page_path: str(raw?.page_path, 300) ?? '/',
      form_id: str(raw?.form_id, 80),
      name: simulate ? null : str(raw?.name, 160),
      email: !simulate && email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email.toLowerCase() : null,
      phone: simulate ? null : str(raw?.phone, 60),
      language: str(raw?.language, 5) === 'en' ? 'en' : 'cs',
      session_key: str(raw?.session_key, 120),
      payload: simulate
        ? { simulated: true, qualification: kind === 'high_value' ? 'qualified' : 'partial', had_contact_details: !!email }
        : typeof raw?.payload === 'object' && raw?.payload !== null
          ? raw.payload
          : {},
      recovery_status: simulate ? 'skipped' : 'pending',
      simulated: simulate,
    }


    const completed = raw?.completed === true || raw?.payload?.completed === true

    // One row per session + form, so repeated exit attempts do not spam the list.
    let signalId: string | null = null
    if (record.session_key) {
      const { data: existing } = await supabase
        .from('visitor_signals')
        .select('id, recovery_status')
        .eq('session_key', record.session_key)
        .eq('kind', kind)
        .eq('form_id', record.form_id ?? '')
        .maybeSingle()
      if (existing?.id) {
        if (completed) {
          await supabase
            .from('visitor_signals')
            .update({ recovery_status: 'converted', recovered_at: new Date().toISOString() })
            .eq('id', existing.id)
          return new Response(JSON.stringify({ ok: true, id: existing.id, converted: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        // Never re-arm a row that was already emailed, converted or skipped.
        const update = existing.recovery_status === 'pending'
          ? record
          : { ...record, recovery_status: existing.recovery_status }
        await supabase.from('visitor_signals').update(update).eq('id', existing.id)
        signalId = existing.id
      }
    }
    if (completed && !signalId) {
      return new Response(JSON.stringify({ ok: true, converted: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!signalId) {
      const { data, error } = await supabase
        .from('visitor_signals')
        .insert(record)
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      signalId = data.id
    }

    // Live alert for visitors that already identified themselves or hit a
    // high-value page while abandoning.
    const highValue =
      !simulate &&
      (kind === 'high_value' ||
        (!!record.email && /calculator|offer|grant|package|quote|contact/i.test(record.page_path)))

    if (highValue && gmailFallbackAvailable()) {
      const lines = [
        `<p><strong>${kind.replace('_', ' ')}</strong> on <code>${record.page_path}</code></p>`,
        `<p>Name: ${record.name ?? '—'}<br/>Email: ${record.email ?? '—'}<br/>Phone: ${record.phone ?? '—'}</p>`,
        `<p>Form: ${record.form_id ?? '—'} · Language: ${record.language}</p>`,
        `<pre>${JSON.stringify(record.payload).slice(0, 1200)}</pre>`,
        '<p><a href="https://www.fastmedia.pro/admin/prospecting">Open the prospecting desk</a></p>',
      ].join('')
      const alert = await sendViaGmail(
        ALERT_TO,
        `Visitor alert: ${record.name ?? record.email ?? 'anonymous'} on ${record.page_path}`,
        lines,
      )
      if (alert.sent) {
        await supabase
          .from('visitor_signals')
          .update({ alerted_at: new Date().toISOString() })
          .eq('id', signalId)
      }
    }

    return new Response(JSON.stringify({ ok: true, id: signalId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('visitor-signal failed:', error)
    return new Response(JSON.stringify({ error: 'server_error', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

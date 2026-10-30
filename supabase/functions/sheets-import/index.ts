// Admin-only: reads a Google Sheet (via the linked Google Sheets connection) for Email Studio personalisation.
// action "tabs" -> list tab names; action "rows" -> return the tab as TSV text (read-only).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_sheets/v4'
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

export function sheetIdFrom(input: string): string | null {
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/)
  if (m) return m[1]
  return /^[a-zA-Z0-9_-]{20,}$/.test(input.trim()) ? input.trim() : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)
  const lovable = Deno.env.get('LOVABLE_API_KEY'), conn = Deno.env.get('GOOGLE_SHEETS_API_KEY')
  if (!lovable || !conn) return json({ error: 'Google Sheets is not connected' }, 500)
  try {
    const body = await req.json().catch(() => ({}))
    const id = sheetIdFrom(String(body?.sheet ?? ''))
    if (!id) return json({ error: 'Paste a Google Sheets link' }, 400)
    const headers = { Authorization: `Bearer ${lovable}`, 'X-Connection-Api-Key': conn }

    if (body?.action === 'rows') {
      const tab = String(body?.tab ?? '').slice(0, 100)
      if (!tab) return json({ error: 'Pick a tab' }, 400)
      const range = `'${tab.replace(/'/g, "''")}'!A1:Z2000`
      const r = await fetch(`${GATEWAY_URL}/spreadsheets/${id}/values/${encodeURI(range)}`, { headers })
      if (!r.ok) return json({ error: 'Google Sheets request failed', status: r.status, details: await r.text() }, r.status)
      const values: string[][] = (await r.json()).values ?? []
      const clean = (v: unknown) => String(v ?? '').replace(/[\t\r\n]+/g, ' ').trim()
      return json({ tsv: values.map((row) => row.map(clean).join('\t')).join('\n'), rows: Math.max(0, values.length - 1) })
    }

    const r = await fetch(`${GATEWAY_URL}/spreadsheets/${id}?fields=properties.title,sheets.properties.title`, { headers })
    if (!r.ok) return json({ error: 'Google Sheets request failed', status: r.status, details: await r.text() }, r.status)
    const d = await r.json()
    return json({ title: d?.properties?.title ?? '', tabs: (d?.sheets ?? []).map((s: any) => s?.properties?.title).filter(Boolean) })
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500)
  }
})

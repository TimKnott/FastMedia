// Admin-only: culturally adapts an email to Czech/German (not literal translation),
// or back-translates text to English for checking. {{placeholders}} are preserved.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'
import { generateJson } from '../_shared/ai-json.ts'

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const LANG: Record<string, string> = { cs: 'Czech', de: 'German', en: 'British English' }
const placeholders = (s: string) => [...new Set(s.match(/\{\{\s*[a-z_]+\s*\}\}/gi) ?? [])]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)
  try {
    const body = await req.json().catch(() => ({}))
    const mode = body?.mode === 'back' ? 'back' : 'adapt'
    const target = typeof body?.target === 'string' && LANG[body.target] ? body.target : 'cs'
    const subject = typeof body?.subject === 'string' ? body.subject.slice(0, 300) : ''
    const html = typeof body?.html === 'string' ? body.html.slice(0, 20000) : ''
    if (!html && !subject) return json({ error: 'empty' }, 400)

    const keep = placeholders(subject + html)
    const instructions =
      mode === 'adapt'
        ? `You are a native ${LANG[target]} B2B copywriter. Rewrite the cold email for a small local business owner in ${target === 'cs' ? 'the Czech Republic' : 'Germany/Austria'}. Adapt, do not translate literally: natural native phrasing, formal address (${target === 'cs' ? 'Vy/Vás' : 'Sie'}), local greeting/sign-off conventions, concise and honest. Never invent facts, prices, results or guarantees. Keep every HTML tag, link URL and image exactly. Keep these placeholders byte-for-byte unchanged: ${keep.join(', ') || 'none'}.`
        : `Translate the text faithfully into plain British English so a non-native speaker can check its meaning. Keep placeholders unchanged. Return HTML with the same structure.`

    const out = await generateJson<{ subject: string; html: string; notes: string }>(
      `Subject: ${subject}\n\nHTML body:\n${html}`,
      {
        instructions,
        schemaName: 'adapted_email',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['subject', 'html', 'notes'],
          properties: {
            subject: { type: 'string' },
            html: { type: 'string' },
            notes: { type: 'string', description: 'Short English note on cultural changes made' },
          },
        },
      },
    )
    const missing = keep.filter((p) => !(out.subject + out.html).includes(p))
    return json({ ...out, missing_placeholders: missing })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('email-adapt failed', msg)
    const status = /ai_gateway_failed (\d{3})/.exec(msg)?.[1]
    return json({ error: 'adapt_failed', details: msg.slice(0, 300) }, status ? Number(status) : 500)
  }
})

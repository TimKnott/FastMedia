import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'
import { analyse, fetchPage } from '../_shared/geo-html.ts'
import { aiJson, GUARDRAILS } from '../_shared/geo-ai.ts'

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
const Body = z.object({ id: z.string().uuid() })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)
  const parsed = Body.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return json({ error: 'id is required' }, 400)
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    const { data: comp } = await db.from('geo_competitors').select('*').eq('id', parsed.data.id).single()
    if (!comp) return json({ error: 'Competitor not found' }, 404)
    const base = new URL(comp.url.startsWith('http') ? comp.url : `https://${comp.url}`)

    const t0 = Date.now()
    const home = await fetchPage(base.href)
    const homeMs = Date.now() - t0
    if (!home.html) return json({ error: `Could not read ${base.href} (status ${home.status}).` }, 502)
    const homeA = analyse(base.href, home.status, home.html)
    // Up to 6 more pages from their own navigation.
    const more = homeA.internalLinks.filter((p) => p !== '/' && !/\.(pdf|jpg|png|zip)$/i.test(p)).slice(0, 6)
    const extra = await Promise.all(more.map(async (p) => {
      const u = new URL(p, base).href
      const r = await fetchPage(u)
      return analyse(u, r.status, r.html)
    }))
    const all = [homeA, ...extra.filter((e) => e.status === 200)]
    const technical = {
      pages_read: all.length,
      home_response_ms: homeMs,
      schema_types: [...new Set(all.flatMap((p) => p.schemaTypes))],
      pages_with_h1: all.filter((p) => p.h1s.length === 1).length,
      avg_words: Math.round(all.reduce((s, p) => s + p.wordCount, 0) / all.length),
      images_missing_alt: all.reduce((s, p) => s + p.imagesMissingAlt, 0),
      has_meta_descriptions: all.filter((p) => p.description).length,
      html_lang: homeA.lang,
    }

    const { data: facts } = await db.from('geo_business_facts').select('label, value, verified')
    const { data: ours } = await db.from('geo_page_audits').select('path, title, headings').order('created_at', { ascending: false }).limit(120)
    const ourTopics = [...new Map((ours ?? []).map((p) => [p.path, `${p.path}: ${p.title}`])).values()].join('\n')
    const theirText = all.map((p) => `URL ${p.path}\nTitle: ${p.title}\nHeadings: ${p.headings.map((h) => h.text).join(' | ')}\nText: ${p.text.slice(0, 2500)}`).join('\n\n')

    const system = `You compare a competitor's public website with FastMedia.Pro to find factual content gaps. ${GUARDRAILS}\nEverything you state about the competitor comes from the page text supplied; mark anything not directly visible there as "needs verification". Write in British English.`
    const user = `FastMedia facts:\n${(facts ?? []).map((f) => `- ${f.label}: ${f.value} [${f.verified ? 'verified' : 'unverified'}]`).join('\n')}\n\nFastMedia pages:\n${ourTopics}\n\nCompetitor ${base.hostname} pages:\n${theirText}\n\nTechnical measurements (observed): ${JSON.stringify(technical)}\n\nReturn json: {"summary": string, "comparison": [{"area": string, "competitor": string, "fastmedia": string, "needs_verification": boolean}], "gaps": [{"topic": string, "question": string, "why": string, "suggested_page": string}], "recommendations": [string], "missing_info": [string]}. Areas must cover: services and products, target audiences, geographic coverage, content depth, customer questions answered, pricing transparency, reviews and trust signals, case studies and proof, technical SEO, structured data, page speed and accessibility, brand mentions and third-party references.`

    const report = { ...(await aiJson(system, user)), technical, analysed_pages: all.map((p) => p.url), note: 'Brand mentions and referring domains need Semrush or manual checks; page-speed figure is a single server-side fetch, not Core Web Vitals.' }
    await db.from('geo_competitors').update({ report, analysed_at: new Date().toISOString(), name: comp.name || base.hostname }).eq('id', comp.id)
    return json({ ok: true, report })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'
import { aiJson, GUARDRAILS } from '../_shared/geo-ai.ts'

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const KINDS = {
  page_brief: 'a page brief (search intent, audience, primary question, title, URL, H1, outline, internal links, required evidence, recommended schema)',
  faq: 'an FAQ section of 5–8 real customer questions with concise, direct answers',
  metadata: 'an SEO title (max 60 chars) and meta description (120–160 chars)',
  schema: 'JSON-LD structured data for this page (put it in "json_ld"); include only properties backed by verified facts',
  internal_links: 'internal-link recommendations (from which page, anchor text, to which page, why)',
  content_update: 'an improved version of the page content: a short direct answer at the top, clear H2/H3 structure, definitions, step-by-step explanation, FAQ and a clear call to action',
  comparison_outline: 'a neutral comparison-page outline that uses only verifiable information and marks every competitor fact as needing verification',
  question_page: 'a customer-question page outline answering one specific question directly',
  local_outline: 'a local service page outline — only for a location listed in the verified service locations; otherwise refuse and explain in missing_info',
  content_plan: 'a topical-authority content plan of 6–12 page ideas (core service, industry/use-case, problem, guide, glossary, neutral comparison). No doorway or duplicate location pages; only locations genuinely served',
} as const

const Body = z.object({
  kind: z.enum(Object.keys(KINDS) as [keyof typeof KINDS, ...(keyof typeof KINDS)[]]),
  path: z.string().max(300).optional(),
  language: z.enum(['en', 'cs']).default('en'),
  instructions: z.string().max(2000).optional(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)
  const parsed = Body.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400)
  const { kind, path, language, instructions } = parsed.data
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    if (path) {
      const { data: locked } = await db.from('geo_locked_pages').select('path').eq('path', path).maybeSingle()
      if (locked && kind === 'content_update') return json({ error: 'This page is marked "do not change".' }, 409)
    }
    const { data: facts } = await db.from('geo_business_facts').select('label, value, verified, source').order('sort_order')
    const factText = (facts ?? []).filter((f) => f.value).map((f) => `- ${f.label}: ${f.value} [${f.verified ? 'VERIFIED' : 'UNVERIFIED'}; source: ${f.source}]`).join('\n')
    const anyUnverified = (facts ?? []).some((f) => f.value && !f.verified)

    let pageText = ''
    let before = ''
    if (path) {
      const { data: page } = await db.from('geo_page_audits').select('title, description, h1, headings, text_excerpt, issues')
        .eq('path', path).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (page) {
        pageText = `Current page ${path}\nTitle: ${page.title}\nDescription: ${page.description}\nH1: ${page.h1}\nHeadings: ${(page.headings as { text: string }[]).map((h) => h.text).join(' | ')}\nText: ${page.text_excerpt}\nAudit issues: ${(page.issues as { message: string }[]).map((i) => i.message).join('; ')}`
        before = kind === 'metadata' ? `Title: ${page.title}\nDescription: ${page.description}` : (page.text_excerpt ?? '')
      }
    }
    const { data: pages } = await db.from('geo_page_audits').select('path, title').order('created_at', { ascending: false }).limit(150)
    const sitePages = [...new Map((pages ?? []).map((p) => [p.path, p.title])).entries()].slice(0, 100).map(([p, t]) => `${p} — ${t}`).join('\n')

    const system = `You are a careful SEO and generative-engine-optimisation editor for FastMedia.Pro.\n${GUARDRAILS}\nWrite in ${language === 'cs' ? 'Czech' : 'British English'}.`
    const shape = kind === 'content_plan'
      ? `{"title": string, "facts": [{"fact": string, "source": string}], "recommendations": [string], "missing_info": [string], "ideas": [{"page_type": string, "search_intent": string, "audience": string, "primary_question": string, "title": string, "url": string, "h1": string, "outline": [string], "internal_links": [string], "required_facts": [string], "schema_types": [string], "needs_approval": boolean}]}`
      : `{"title": string, "facts": [{"fact": string, "source": string}], "recommendations": [string], "missing_info": [string], "content": string (markdown), "json_ld": object or null}`
    const user = `Task: produce ${KINDS[kind]}.\n\nVerified and unverified business facts:\n${factText}\n\n${pageText}\n\nExisting site pages (for internal links):\n${sitePages}\n\n${instructions ? `Extra instructions from the owner: ${instructions}\n\n` : ''}Respond with json in exactly this shape: ${shape}`

    const out = await aiJson(system, user)
    const arr = (v: unknown) => (Array.isArray(v) ? v : [])

    if (kind === 'content_plan') {
      const ideas = arr(out.ideas).slice(0, 15).map((i: any) => ({
        page_type: String(i.page_type ?? 'guide'), search_intent: i.search_intent ?? null, audience: i.audience ?? null,
        primary_question: i.primary_question ?? null, title: String(i.title ?? 'Untitled'), url: i.url ?? null, h1: i.h1 ?? null,
        outline: arr(i.outline), internal_links: arr(i.internal_links), required_facts: arr(i.required_facts),
        schema_types: arr(i.schema_types).map(String), needs_approval: true, status: 'idea',
      }))
      if (ideas.length) await db.from('geo_content_plan').insert(ideas)
      return json({ ok: true, ideas: ideas.length, missing_info: arr(out.missing_info) })
    }

    const { data: item, error } = await db.from('geo_generated_items').insert({
      kind, target_path: path ?? null, language,
      title: String(out.title ?? `${kind} ${path ?? ''}`).slice(0, 200),
      facts: arr(out.facts), recommendations: arr(out.recommendations), missing_info: arr(out.missing_info),
      before_content: before || null, after_content: typeof out.content === 'string' ? out.content : null,
      json_ld: out.json_ld && typeof out.json_ld === 'object' ? out.json_ld : null,
      unverified: anyUnverified || arr(out.missing_info).length > 0,
      status: 'draft',
      history: [{ at: new Date().toISOString(), action: 'generated' }],
    }).select('*').single()
    if (error) throw new Error(error.message)
    return json({ ok: true, item })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { isAuthorizedAdminCaller, unauthorizedResponse } from '../_shared/require-admin.ts'
import { analyse, fetchPage, type PageAnalysis } from '../_shared/geo-html.ts'

const SITE = 'https://www.fastmedia.pro'
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

// Bilingual (CS/EN) signals for "does this page explain…" checks.
const SIGNALS: Record<string, RegExp> = {
  offers: /(we (build|create|offer|design)|our services|websites?|web design|služb|weby?|webov|nabízíme|tvorba)/i,
  audience: /(for (trades|small business|businesses|plumbers|salons|local)|řemesln|malé firmy|podnikatel|živnostník|for you|pro vás)/i,
  problems: /(problem|struggl|lose customers|no enquiries|slow|outdated|problém|ztrácí|zastaral|pomalý)/i,
  location: /(czech|česk|louny|ústeck|prague|praha|europe|worldwide|celý svět)/i,
  why: /(why |proč|guarantee|záruk|refund|vrácení|case stud|případov|results|výsledky)/i,
  difference: /(unlike|compared|instead of|narozdíl|na rozdíl|oproti|differen|jinak než|only we|jako jediní)/i,
}
const CLAIM_PATTERNS: { type: string; re: RegExp }[] = [
  { type: 'superlative', re: /[^.!?]*\b(best|leading|number one|no\. ?1|#1|top-rated|world-class|nejlepší|špičkov|jednička)\b[^.!?]*[.!?]?/gi },
  { type: 'statistic', re: /[^.!?]*\b\d{1,3}(?:[.,]\d+)? ?%[^.!?]*[.!?]?/g },
  { type: 'certification', re: /[^.!?]*\b(ISO ?\d+|certified|certifikov|accredited|akreditov|partner)\b[^.!?]*[.!?]?/gi },
  { type: 'government', re: /[^.!?]*\b(government|vládní|registered (supplier|provider)|registrovan[ýá] (dodavatel|poskytovatel)|grant)\b[^.!?]*[.!?]?/gi },
  { type: 'guarantee', re: /[^.!?]*\b(guarantee|guaranteed|záruk|garantuj)\w*[^.!?]*[.!?]?/gi },
]

function issuesFor(p: PageAnalysis, dupTitles: Set<string>, dupDesc: Set<string>) {
  const out: { severity: 'high' | 'medium' | 'low'; code: string; message: string }[] = []
  const add = (severity: 'high' | 'medium' | 'low', code: string, message: string) => out.push({ severity, code, message })
  if (p.status !== 200) add('high', 'http', `Page answered with status ${p.status || 'no response'}.`)
  if (!p.title) add('high', 'title_missing', 'No page title.')
  else if (p.title.length > 60) add('low', 'title_long', `Title is ${p.title.length} characters (aim for under 60).`)
  else if (p.title.length < 20) add('medium', 'title_short', 'Title is very short and may not describe the page.')
  if (dupTitles.has(p.title)) add('medium', 'title_duplicate', 'Same title as another page.')
  if (!p.description) add('high', 'desc_missing', 'No meta description.')
  else if (p.description.length > 160) add('low', 'desc_long', `Description is ${p.description.length} characters (aim for 120–160).`)
  if (p.description && dupDesc.has(p.description)) add('medium', 'desc_duplicate', 'Same description as another page.')
  if (!p.canonical) add('medium', 'canonical_missing', 'No canonical link.')
  if (/noindex/i.test(p.robots)) add('medium', 'noindex', 'Page asks search engines not to index it — check this is intended.')
  if (p.h1s.length === 0) add('high', 'h1_missing', 'No H1 heading in the HTML crawlers receive.')
  if (p.h1s.length > 1) add('medium', 'h1_multiple', `${p.h1s.length} H1 headings — use one.`)
  let prev = 0
  for (const h of p.headings) { if (prev && h.level > prev + 1) { add('low', 'heading_skip', `Heading jumps from H${prev} to H${h.level} ("${h.text.slice(0, 40)}").`); break } prev = h.level }
  if (p.wordCount < 250) add('high', 'thin', `Only ${p.wordCount} words of crawlable text — thin, or content only appears after scripts run.`)
  else if (p.wordCount < 500) add('medium', 'thin', `${p.wordCount} words — consider adding direct answers and FAQs.`)
  if (!p.ogTitle || !p.ogDescription) add('low', 'og_missing', 'Missing Open Graph title or description.')
  if (p.imagesMissingAlt) add('medium', 'alt_missing', `${p.imagesMissingAlt} of ${p.imagesTotal} images have no alt text.`)
  if (p.schemaErrors) add('high', 'schema_invalid', `${p.schemaErrors} structured-data block(s) are not valid JSON.`)
  if (p.schemaTypes.length === 0) add('medium', 'schema_missing', 'No structured data on this page.')
  if (p.path !== '/' && !p.hasBreadcrumb) add('low', 'breadcrumb_missing', 'No breadcrumbs.')
  if (p.internalLinks.length < 3) add('medium', 'links_few', `Only ${p.internalLinks.length} internal links.`)
  if (!/\?|faq|otázk|question/i.test(p.headings.map((h) => h.text).join(' '))) add('low', 'no_questions', 'No question-style headings or FAQ that AI answers could quote.')
  for (const [k, re] of Object.entries(SIGNALS)) if (!re.test(p.text)) add(k === 'difference' ? 'low' : 'medium', `explain_${k}`, {
    offers: 'Does not clearly say what the business offers.',
    audience: 'Does not clearly say who it serves.',
    problems: 'Does not name the problems it solves.',
    location: 'Does not say where the business operates.',
    why: 'Does not explain why customers should choose it.',
    difference: 'Does not explain how it differs from alternatives.',
  }[k]!)
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!(await isAuthorizedAdminCaller(req))) return unauthorizedResponse(corsHeaders)
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  try {
    const sm = await fetchPage(`${SITE}/sitemap.xml`)
    const smText = sm.html || (await (await fetch(`${SITE}/sitemap.xml`)).text())
    const urls = [...new Set([...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()))].slice(0, 150)
    if (urls.length === 0) return json({ error: 'Sitemap returned no pages.' }, 502)

    const { data: run } = await db.from('geo_audit_runs').insert({ status: 'running' }).select('id').single()
    const pages: PageAnalysis[] = []
    for (let i = 0; i < urls.length; i += 8) {
      const batch = await Promise.all(urls.slice(i, i + 8).map(async (u) => {
        const r = await fetchPage(u)
        return analyse(u, r.status, r.html)
      }))
      pages.push(...batch)
    }

    const count = (arr: string[]) => { const m = new Map<string, number>(); arr.forEach((x) => x && m.set(x, (m.get(x) ?? 0) + 1)); return new Set([...m].filter(([, n]) => n > 1).map(([k]) => k)) }
    const dupTitles = count(pages.map((p) => p.title))
    const dupDesc = count(pages.map((p) => p.description))
    const hashes = new Map<string, number>()
    const hashOf = async (t: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(t.slice(0, 5000))))].map((b) => b.toString(16).padStart(2, '0')).join('')

    const inbound = new Map<string, number>()
    pages.forEach((p) => p.internalLinks.forEach((l) => inbound.set(l, (inbound.get(l) ?? 0) + 1)))

    const rows = []
    const claims: { path: string; claim: string; claim_type: string }[] = []
    const sev = { high: 0, medium: 0, low: 0 }
    for (const p of pages) {
      const h = await hashOf(p.text)
      hashes.set(h, (hashes.get(h) ?? 0) + 1)
      const issues = issuesFor(p, dupTitles, dupDesc)
      if ((inbound.get(p.path) ?? 0) < 2 && p.path !== '/') issues.push({ severity: 'medium', code: 'orphan', message: `Only ${inbound.get(p.path) ?? 0} other pages link here.` })
      const scores: Record<string, boolean> = {}
      for (const [k, re] of Object.entries(SIGNALS)) scores[k] = re.test(p.text)
      issues.forEach((i) => sev[i.severity]++)
      for (const { type, re } of CLAIM_PATTERNS) {
        for (const m of p.text.match(re) ?? []) {
          const c = m.trim().slice(0, 300)
          if (c.length > 12) claims.push({ path: p.path, claim: c, claim_type: type })
        }
      }
      rows.push({
        run_id: run!.id, url: p.url, path: p.path, http_status: p.status,
        title: p.title, description: p.description, h1: p.h1s[0] ?? null, word_count: p.wordCount,
        scores, issues, schema_types: p.schemaTypes, headings: p.headings,
        internal_links: p.internalLinks.length, text_excerpt: p.text.slice(0, 4000), content_hash: h,
      })
    }
    for (const r of rows) if ((hashes.get(r.content_hash) ?? 0) > 1) { r.issues.push({ severity: 'high', code: 'duplicate_content', message: 'Crawlable text is identical to another page.' }); sev.high++ }

    for (let i = 0; i < rows.length; i += 50) await db.from('geo_page_audits').insert(rows.slice(i, i + 50))
    const uniqueClaims = [...new Map(claims.map((c) => [`${c.path}|${c.claim}`, c])).values()].slice(0, 500)
    if (uniqueClaims.length) await db.from('geo_claims').upsert(uniqueClaims, { onConflict: 'path,claim', ignoreDuplicates: true })

    const summary = {
      pages: rows.length, issues: sev,
      schema_coverage: rows.filter((r) => r.schema_types.length).length,
      thin: rows.filter((r) => (r.word_count ?? 0) < 250).length,
      claims: uniqueClaims.length,
    }
    await db.from('geo_audit_runs').update({ status: 'done', finished_at: new Date().toISOString(), pages: rows.length, summary }).eq('id', run!.id)
    return json({ ok: true, run_id: run!.id, summary })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})

// Lightweight HTML analysis shared by the GEO audit and competitor tools.
export interface PageAnalysis {
  url: string
  path: string
  status: number
  title: string
  description: string
  canonical: string
  robots: string
  ogTitle: boolean
  ogDescription: boolean
  h1s: string[]
  headings: { level: number; text: string }[]
  imagesTotal: number
  imagesMissingAlt: number
  internalLinks: string[]
  externalLinks: number
  schemaTypes: string[]
  schemaErrors: number
  text: string
  wordCount: number
  hasBreadcrumb: boolean
  lang: string
}

const decode = (s: string) =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
const strip = (s: string) => decode(s.replace(/<[^>]+>/g, ' '))
const attr = (tag: string, name: string) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? decode(m[2] ?? m[3] ?? '') : ''
}
const meta = (html: string, key: string, by = 'name') => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const t of tags) if (attr(t, by).toLowerCase() === key) return attr(t, 'content')
  return ''
}

export function analyse(url: string, status: number, html: string): PageAnalysis {
  const u = new URL(url)
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: strip(m[2]).slice(0, 160),
  })).filter((h) => h.text)
  const imgs = html.match(/<img\b[^>]*>/gi) ?? []
  const links = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi)].map((m) => m[1])
  const internal = new Set<string>()
  let external = 0
  for (const l of links) {
    try {
      const abs = new URL(l, url)
      if (abs.hostname.replace(/^www\./, '') === u.hostname.replace(/^www\./, '')) internal.add(abs.pathname.replace(/\/+$/, '') || '/')
      else if (abs.protocol.startsWith('http')) external++
    } catch { /* ignore */ }
  }
  const schemaTypes: string[] = []
  let schemaErrors = 0
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n: unknown) => {
        if (Array.isArray(n)) return n.forEach(walk)
        if (n && typeof n === 'object') {
          const o = n as Record<string, unknown>
          const t = o['@type']
          if (typeof t === 'string') schemaTypes.push(t)
          if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && schemaTypes.push(x))
          if (o['@graph']) walk(o['@graph'])
        }
      }
      walk(JSON.parse(m[1]))
    } catch { schemaErrors++ }
  }
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
  const text = strip(body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' '))
  const canonicalTag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) ?? [''])[0]
  return {
    url, path: u.pathname.replace(/\/+$/, '') || '/', status,
    title, description: meta(html, 'description'),
    canonical: canonicalTag ? attr(canonicalTag, 'href') : '',
    robots: meta(html, 'robots'),
    ogTitle: !!meta(html, 'og:title', 'property'),
    ogDescription: !!meta(html, 'og:description', 'property'),
    h1s: headings.filter((h) => h.level === 1).map((h) => h.text),
    headings: headings.slice(0, 60),
    imagesTotal: imgs.length,
    imagesMissingAlt: imgs.filter((t) => !/\balt\s*=\s*["'][^"']+["']/i.test(t)).length,
    internalLinks: [...internal],
    externalLinks: external,
    schemaTypes: [...new Set(schemaTypes)],
    schemaErrors,
    text: text.slice(0, 20000),
    wordCount: text ? text.split(' ').length : 0,
    hasBreadcrumb: schemaTypes.includes('BreadcrumbList') || /breadcrumb/i.test(html),
    lang: (html.match(/<html[^>]*lang=["']([^"']+)/i)?.[1] ?? ''),
  }
}

export async function fetchPage(url: string): Promise<{ status: number; html: string }> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'FastMediaGEOAudit/1.0 (+https://www.fastmedia.pro)' }, redirect: 'follow' })
    const html = r.headers.get('content-type')?.includes('html') ? await r.text() : ''
    return { status: r.status, html }
  } catch {
    return { status: 0, html: '' }
  }
}

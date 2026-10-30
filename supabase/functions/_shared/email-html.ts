// Minimal allow-list sanitiser for staff-authored email HTML (no DOM needed, unit-tested).
// Keeps simple formatting, links, images and buttons; strips scripts, styles blocks,
// event handlers and javascript: URLs.

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'h2', 'h3', 'div', 'span', 'blockquote', 'hr',
])
const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'width', 'height', 'style', 'target', 'rel'])

const safeUrl = (v: string) => /^(https?:|mailto:|tel:)/i.test(v.trim())
const safeStyle = (v: string) => !/(expression|url\s*\(|javascript:|@import|behavior)/i.test(v)

export function sanitizeEmailHtml(input: string): string {
  let html = String(input ?? '').slice(0, 60000)
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  html = html.replace(/<(script|style|iframe|object|embed|form|svg|math)[\s\S]*?<\/\1\s*>/gi, '')
  html = html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''
    if (full.startsWith('</')) return `</${tag}>`
    const attrs: string[] = []
    const re = /([a-zA-Z-:]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g
    let m: RegExpExecArray | null
    while ((m = re.exec(rawAttrs))) {
      const name = m[1].toLowerCase()
      const value = (m[3] ?? m[4] ?? m[5] ?? '').replace(/"/g, '&quot;')
      if (!ALLOWED_ATTRS.has(name)) continue
      if ((name === 'href' || name === 'src') && !safeUrl(value)) continue
      if (name === 'style' && !safeStyle(value)) continue
      attrs.push(`${name}="${value}"`)
    }
    if (tag === 'a') attrs.push('target="_blank"', 'rel="noopener"')
    const selfClose = tag === 'br' || tag === 'img' || tag === 'hr'
    return `<${tag}${attrs.length ? ' ' + [...new Set(attrs)].join(' ') : ''}${selfClose ? ' /' : ''}>`
  })
  return html.trim()
}

/** Plain-text twin of an HTML email, used for the text part and reply matching. */
export function htmlToPlainText(html: string): string {
  return String(html ?? '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
      const t = text.replace(/<[^>]+>/g, '').trim()
      return t && t !== href ? `${t} (${href})` : href
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h2|h3|li|blockquote)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

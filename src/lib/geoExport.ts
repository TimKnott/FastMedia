// Client-side exports for the AI Search Visibility workspace.
export const download = (name: string, content: string, type = 'text/plain') => {
  const blob = new Blob([content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const cell = (v: unknown) => {
  const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  return [keys.join(','), ...rows.map((r) => keys.map((k) => cell(r[k])).join(','))].join('\n')
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export interface ExportItem {
  title: string | null
  kind: string
  target_path: string | null
  status: string
  unverified: boolean
  facts: { fact: string; source: string }[]
  recommendations: string[]
  missing_info: string[]
  after_content: string | null
  json_ld: unknown
}

const WARNING = 'WARNING: contains unverified information — confirm every fact before publishing.'

export const itemToMarkdown = (i: ExportItem) =>
  [
    `# ${i.title ?? i.kind}`,
    `Type: ${i.kind} · Page: ${i.target_path ?? '—'} · Status: ${i.status}`,
    i.unverified ? `\n> ${WARNING}` : '',
    '\n## Facts (from verified sources)',
    ...i.facts.map((f) => `- ${f.fact} _(source: ${f.source})_`),
    '\n## Recommendations',
    ...i.recommendations.map((r) => `- ${r}`),
    '\n## Missing information',
    ...(i.missing_info.length ? i.missing_info.map((m) => `- ${m}`) : ['- none']),
    i.after_content ? `\n## Proposed content\n\n${i.after_content}` : '',
    i.json_ld ? `\n## JSON-LD\n\n\`\`\`json\n${JSON.stringify(i.json_ld, null, 2)}\n\`\`\`` : '',
  ].join('\n')

export const itemToHtml = (i: ExportItem) =>
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(i.title ?? i.kind)}</title><body>` +
  `<h1>${esc(i.title ?? i.kind)}</h1>` +
  (i.unverified ? `<p style="color:#b45309"><strong>${WARNING}</strong></p>` : '') +
  `<h2>Facts</h2><ul>${i.facts.map((f) => `<li>${esc(f.fact)} <em>(${esc(f.source)})</em></li>`).join('')}</ul>` +
  `<h2>Recommendations</h2><ul>${i.recommendations.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` +
  `<h2>Missing information</h2><ul>${i.missing_info.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` +
  (i.after_content ? `<h2>Proposed content</h2><pre style="white-space:pre-wrap">${esc(i.after_content)}</pre>` : '') +
  (i.json_ld ? `<script type="application/ld+json">${JSON.stringify(i.json_ld)}</script>` : '') +
  `</body></html>`

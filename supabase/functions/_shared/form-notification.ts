// Trusted project configuration, never derived from browser Origin or form details.
export const FORM_SOURCE = { name: 'FastMedia.pro', url: 'https://www.fastmedia.pro' } as const
export interface FormNotification { form: string; id: string; timestamp: string }
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c))
export function formNotification(subject: string, html: string, text: string, record: FormNotification) {
  const metadata = `Source website: ${FORM_SOURCE.url}\nForm: ${record.form}\nSubmitted at: ${record.timestamp}\nReference: ${record.id}`
  return {
    subject: `[${FORM_SOURCE.name}] ${subject.replace(/^\[FastMedia\.pro\]\s*/i, '').replace(/[\r\n]/g, ' ')}`,
    html: html.replace(/<\/body>/i, `<p>${escape(metadata).replace(/\n/g, '<br/>')}</p></body>`),
    text: `${text}\n\n${metadata}`,
  }
}
export function submitterReplyTo(value: unknown): string | undefined {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined
}

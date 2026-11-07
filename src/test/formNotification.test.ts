import { describe, it, expect } from 'vitest'
import { formNotification, submitterReplyTo } from '../../supabase/functions/_shared/form-notification'
describe('trusted form notification', () => {
  it('uses configured source and stored reference without duplicate prefixes', () => {
    const result = formNotification('[FastMedia.pro] Enquiry\r\nInjected', '<body>Content</body>', 'Content', { form: 'Contact', id: 'stored-id', timestamp: '2026-11-07T20:28:00Z' })
    expect(result.subject).toBe('[FastMedia.pro] Enquiry  Injected')
    for (const value of ['https://www.fastmedia.pro', 'Contact', 'stored-id', '2026-11-07T20:28:00Z']) expect(result.text).toContain(value)
    expect(result.html).toContain('Reference: stored-id')
  })
  it('escapes metadata and rejects injected Reply-To', () => {
    expect(formNotification('Test', '<body></body>', '', { form: '<script>', id: 'id', timestamp: 'date' }).html).not.toContain('<script>')
    expect(submitterReplyTo('visitor@example.com')).toBe('visitor@example.com')
    expect(submitterReplyTo('visitor@example.com\r\nBcc:evil@example.com')).toBeUndefined()
  })
})

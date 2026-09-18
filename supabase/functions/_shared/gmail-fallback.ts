// Fallback sender: routes an already-rendered email through the connected
// Google Workspace mailbox when Lovable's managed sender domain is not
// verified yet. Keeps notifications flowing instead of silently failing.

const GATEWAY = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'

const b64 = (s: string) =>
  btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(''))

const headerValue = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`)

export function gmailFallbackAvailable(): boolean {
  return !!Deno.env.get('LOVABLE_API_KEY') && !!Deno.env.get('GOOGLE_MAIL_API_KEY')
}

export interface GmailFallbackResult {
  sent: boolean
  id?: string | null
  error?: string
}

export async function sendViaGmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<GmailFallbackResult> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const connectionKey = Deno.env.get('GOOGLE_MAIL_API_KEY')
  if (!lovableKey || !connectionKey) return { sent: false, error: 'google_mail_not_connected' }

  const boundary = `fm_${crypto.randomUUID().replace(/-/g, '')}`
  const raw = [
    `To: ${to}`,
    `Subject: ${headerValue(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text || html.replace(/<[^>]+>/g, ' ')),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    b64(html),
    `--${boundary}--`,
    '',
  ].join('\r\n')

  const res = await fetch(`${GATEWAY}/users/me/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': connectionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: b64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    }),
  })

  if (!res.ok) {
    const details = (await res.text()).slice(0, 300)
    return { sent: false, error: `gmail_send_failed ${res.status}: ${details}` }
  }
  const sent = await res.json().catch(() => ({}))
  return { sent: true, id: sent?.id ?? null }
}

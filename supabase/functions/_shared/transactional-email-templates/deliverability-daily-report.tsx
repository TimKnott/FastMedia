/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Link } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface FailureRow {
  when: string
  status: string
  template: string
  error?: string | null
  messageUrl?: string | null
}

interface Props {
  probeId?: string
  probeStatus?: string
  probeBadge?: string
  probeRecipient?: string
  probeError?: string | null
  probeLatencyMs?: number | null
  probeMessageId?: string | null
  probeMessageUrl?: string | null
  window?: string
  totals?: { sent?: number; failed?: number; suppressed?: number; pending?: number }
  failures?: FailureRow[]
  suppressions?: number
  generatedAt?: string
}

const FAILURE_STATUSES = ['failed', 'dlq', 'bounced', 'complained', 'suppressed']

const resolveBadge = (status?: string) => {
  if (status === 'sent') return { text: 'PASS', color: '#059669' }
  if (status && FAILURE_STATUSES.includes(status)) return { text: 'FAIL', color: '#dc2626' }
  return { text: 'PENDING / UNKNOWN', color: '#d97706' }
}

const Email = ({
  probeId,
  probeStatus = 'unknown',
  probeBadge,
  probeRecipient,
  probeError,
  probeLatencyMs,
  probeMessageId,
  probeMessageUrl,
  window = 'last 24h',
  totals = {},
  failures = [],
  suppressions = 0,
  generatedAt,
}: Props) => {
  const badgeInfo = resolveBadge(probeStatus)
  const badgeText = probeBadge ?? badgeInfo.text
  const unknown = probeStatus === 'unknown'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Daily deliverability report — {badgeText} ({window})</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Daily deliverability report</Heading>
          <Text style={p}>
            Automated probe from FastMedia.Pro outbound pipeline (<code>notify.fastmedia.pro</code>).
          </Text>

          <Section style={{ ...badgeBox, backgroundColor: badgeInfo.color }}>
            <Text style={badge}>{badgeText}</Text>
            <Text style={badgeSub}>
              Probe to {probeRecipient ?? '—'} — status <strong>{probeStatus}</strong>
              {probeLatencyMs != null ? ` in ${probeLatencyMs} ms` : ''}
            </Text>
          </Section>

          {unknown ? (
            <Text style={noteBox}>
              No log entry matching this probe&rsquo;s own message ID reached a final state during the
              check window. The result is reported as unknown rather than assumed — open the evidence
              link below to see the live status.
            </Text>
          ) : null}

          <Section>
            <Text style={meta}><strong>Probe ID:</strong> {probeId ?? '—'}</Text>
            <Text style={meta}><strong>Message ID:</strong> {probeMessageId ?? '—'}</Text>
            {probeMessageUrl ? (
              <Text style={meta}>
                <strong>Evidence:</strong>{' '}
                <Link href={probeMessageUrl} style={link}>
                  Open this exact log entry
                </Link>
              </Text>
            ) : null}
            <Text style={meta}><strong>Window:</strong> {window}</Text>
            <Text style={meta}><strong>Generated:</strong> {generatedAt ?? '—'}</Text>
            {probeError ? (
              <Text style={{ ...meta, color: '#dc2626' }}>
                <strong>Probe error:</strong> {probeError}
              </Text>
            ) : null}
          </Section>

          <Hr style={hr} />
          <Heading as="h2" style={h2}>Send totals ({window})</Heading>
          <Section>
            <Text style={meta}><strong>Sent:</strong> {totals.sent ?? 0}</Text>
            <Text style={meta}><strong>Failed / DLQ:</strong> {totals.failed ?? 0}</Text>
            <Text style={meta}><strong>Suppressed:</strong> {totals.suppressed ?? 0}</Text>
            <Text style={meta}><strong>Pending:</strong> {totals.pending ?? 0}</Text>
            <Text style={meta}><strong>New suppression entries:</strong> {suppressions}</Text>
          </Section>

          {failures.length > 0 ? (
            <>
              <Hr style={hr} />
              <Heading as="h2" style={h2}>Recent DSN / failures</Heading>
              {failures.map((f, i) => (
                <Section key={i} style={failBox}>
                  <Text style={meta}>
                    <strong>{f.status}</strong> · {f.template} · {f.when}
                  </Text>
                  {f.error ? <Text style={errText}>{f.error}</Text> : null}
                  {f.messageUrl ? (
                    <Text style={meta}>
                      <Link href={f.messageUrl} style={link}>View log entry</Link>
                    </Text>
                  ) : null}
                </Section>
              ))}
            </>
          ) : (
            <>
              <Hr style={hr} />
              <Text style={p}>No failures recorded in the last {window}. 🎉</Text>
            </>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Sent by FastMedia.Pro scheduled deliverability monitor. Full 30-day history at{' '}
            <Link href="https://www.fastmedia.pro/admin/email-deliverability" style={link}>
              Email Deliverability
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => {
    const status = d?.probeStatus
    const label =
      status === 'sent' ? 'PASS' : FAILURE_STATUSES.includes(status) ? 'FAIL' : 'PENDING / UNKNOWN'
    return `[${label}] Daily deliverability report — FastMedia.Pro`
  },
  displayName: 'Daily deliverability report',
  previewData: {
    probeId: 'probe_xyz',
    probeStatus: 'sent',
    probeRecipient: 'support@fastmedia.pro',
    probeLatencyMs: 1240,
    probeMessageId: '712664d2-543a-4408-9b50-ec8ed8703120',
    probeMessageUrl:
      'https://www.fastmedia.pro/admin/email-deliverability?message_id=712664d2-543a-4408-9b50-ec8ed8703120',
    window: 'last 24h',
    totals: { sent: 42, failed: 1, suppressed: 0, pending: 0 },
    failures: [{ when: '3h ago', status: 'dlq', template: 'lead-notification', error: '550 mailbox unavailable' }],
    suppressions: 0,
    generatedAt: new Date().toISOString(),
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '620px', margin: '0 auto', padding: '28px 24px' }
const h1 = { color: '#0f172a', fontSize: '22px', margin: '0 0 12px 0' }
const h2 = { color: '#0f172a', fontSize: '16px', margin: '12px 0 8px 0' }
const p = { color: '#334155', fontSize: '15px', lineHeight: '22px', margin: '0 0 16px 0' }
const meta = { color: '#334155', fontSize: '13px', lineHeight: '20px', margin: '4px 0' }
const hr = { borderColor: '#e2e8f0', margin: '20px 0' }
const link = { color: '#1d4ed8', textDecoration: 'underline' }
const footer = { color: '#64748b', fontSize: '12px', margin: '12px 0 0 0' }
const badgeBox = { borderRadius: '8px', padding: '14px 16px', margin: '8px 0 16px 0', textAlign: 'center' as const }
const badge = { color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }
const badgeSub = { color: '#f1f5f9', fontSize: '13px', margin: '4px 0 0 0' }
const noteBox = {
  color: '#92400e',
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '6px',
  padding: '10px 12px',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px 0',
}
const failBox = { border: '1px solid #fecaca', borderRadius: '6px', padding: '8px 10px', margin: '6px 0', backgroundColor: '#fef2f2' }
const errText = { color: '#991b1b', fontSize: '12px', margin: '4px 0 0 0', fontFamily: 'monospace' }

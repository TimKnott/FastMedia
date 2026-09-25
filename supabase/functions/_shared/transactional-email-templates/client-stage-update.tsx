import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FastMedia.Pro'

type Stage = 'draft_created' | 'admin_edited' | 'signed_off' | 'deposit_paid'

interface StageUpdateProps {
  recipientName?: string
  projectName?: string
  portalUrl?: string
  stage?: Stage
  amount?: string
  currency?: string
  audience?: 'client' | 'admin'
  clientEmail?: string
}

const COPY: Record<Stage, { subject: string; heading: string; body: string; cta: string; adminLine: string }> = {
  draft_created: {
    subject: 'Your project agreement is ready to review',
    heading: 'Your draft agreement is ready',
    body: 'We have prepared the first draft of your project agreement, including the development fee, hosting, AI usage allowance and deposit. Please open your private project area to review the full document and any pricing line items.',
    cta: 'Review my agreement',
    adminLine: 'Draft agreement created and emailed to client.',
  },
  admin_edited: {
    subject: 'Your project agreement has been updated',
    heading: 'We updated your agreement',
    body: 'Your project agreement has been updated with new figures or terms. Please re-open your private project area to review the latest version before signing off.',
    cta: 'View the updated agreement',
    adminLine: 'Agreement edited — client has been notified.',
  },
  signed_off: {
    subject: 'Agreement signed off — next step is the deposit',
    heading: 'Agreement signed off ✓',
    body: 'Thank you — your agreement has been marked as signed off. The next step is the deposit payment. Open your project area for the deposit instructions and to track build progress.',
    cta: 'Open my project',
    adminLine: 'Agreement signed off by admin. Awaiting deposit.',
  },
  deposit_paid: {
    subject: 'Deposit received — build is starting',
    heading: 'Deposit received 🎉',
    body: 'Your deposit has been received in full and your build is now scheduled. You can follow progress, leave sticky-note feedback and approve sections at any time from your private project area.',
    cta: 'Follow my build',
    adminLine: 'Deposit recorded as paid — build can begin.',
  },
}

const StageUpdate = ({
  recipientName, projectName, portalUrl, stage = 'draft_created',
  amount, currency, audience = 'client', clientEmail,
}: StageUpdateProps) => {
  const c = COPY[stage] || COPY.draft_created
  const isAdmin = audience === 'admin'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{isAdmin ? `[Admin] ${c.heading}` : c.heading}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isAdmin
              ? `[Admin] ${c.heading}`
              : (recipientName ? `Hi ${recipientName},` : 'Hello,')}
          </Heading>

          {isAdmin ? (
            <>
              <Text style={text}>
                <strong>{projectName || 'Project'}</strong> — {c.adminLine}
              </Text>
              {clientEmail && (
                <Text style={text}>Client: {clientEmail}</Text>
              )}
              {stage === 'deposit_paid' && amount && (
                <Text style={text}><strong>Amount:</strong> {amount}{currency ? ` ${currency}` : ''}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={text}>{c.body}</Text>
              {stage === 'deposit_paid' && amount && (
                <Text style={text}>
                  <strong>Amount received:</strong> {amount}{currency ? ` ${currency}` : ''}
                </Text>
              )}
            </>
          )}

          {portalUrl && (
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Button href={portalUrl} style={btn}>{isAdmin ? 'Open project area' : c.cta}</Button>
            </Section>
          )}

          {!isAdmin && (
            <Text style={small}>
              🔒 This link is private to you. Please do not forward it.
            </Text>
          )}

          <Hr style={hr} />
          <Text style={text}>
            {isAdmin
              ? 'This is an internal notification.'
              : 'Any questions, simply reply to this email and a real person will help you.'}
          </Text>
          <Text style={footer}>— {SITE_NAME} Team</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: StageUpdate,
  subject: (d: Record<string, any>) => {
    const c = COPY[(d.stage as Stage) || 'draft_created'] || COPY.draft_created
    const prefix = d.audience === 'admin' ? '[Admin] ' : ''
    return `${prefix}${c.subject}${d.projectName ? ` — ${d.projectName}` : ''}`
  },
  displayName: 'Client agreement stage update',
  previewData: {
    recipientName: 'Alex',
    projectName: 'Acme Plumbing website',
    portalUrl: 'https://www.fastmedia.pro/portal/acme',
    stage: 'draft_created',
    audience: 'client',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 14px' }
const btn = {
  backgroundColor: '#0f3a7a', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontWeight: '600' as const, textDecoration: 'none', fontSize: '14px',
}
const small = { fontSize: '12px', color: '#6b7280', lineHeight: '1.6', margin: '12px 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#6b7280', margin: '0' }

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FastMedia.Pro'

interface IntakeReceivedProps {
  recipientName?: string
  trade?: string
  summary?: string
  portalUrl?: string
}

const IntakeReceived = ({ recipientName, trade, summary, portalUrl }: IntakeReceivedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We have your project brief — review starts now</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{recipientName ? `Hi ${recipientName},` : 'Hello,'}</Heading>
        <Text style={text}>
          Thank you for sharing the details of your{trade ? ` ${trade}` : ''} project. A senior member of our team is reviewing your brief now and will reply personally within one working day with a tailored agreement and next steps.
        </Text>
        {summary && (
          <Section style={card}>
            <Text style={cardLabel}>What we captured</Text>
            <Text style={cardBody}>{summary}</Text>
          </Section>
        )}
        {portalUrl && (
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={portalUrl} style={btn}>Open my project area</Button>
          </Section>
        )}
        <Hr style={hr} />
        <Text style={text}>
          If anything has changed, simply reply to this email — a real person will help you straight away.
        </Text>
        <Text style={footer}>— {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: IntakeReceived,
  subject: (d: Record<string, any>) =>
    `We have your brief${d.trade ? ` — ${d.trade}` : ''} | ${SITE_NAME}`,
  displayName: 'Client intake received',
  previewData: {
    recipientName: 'Alex',
    trade: 'plumbing',
    summary: 'New 12-page site with booking, gallery and Google reviews. Launch within 4 weeks.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 14px' }
const card = { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '14px 16px', margin: '8px 0 16px' }
const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#6b7280', margin: '0 0 6px' }
const cardBody = { fontSize: '14px', color: '#111827', lineHeight: '1.6', margin: '0' }
const btn = {
  backgroundColor: '#0f3a7a', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontWeight: '600' as const, textDecoration: 'none', fontSize: '14px',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#6b7280', margin: '0' }

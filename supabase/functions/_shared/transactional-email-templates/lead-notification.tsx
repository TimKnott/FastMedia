import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FastMedia.Pro"

interface LeadNotificationProps {
  name?: string
  email?: string
  trade?: string
  score?: number
  classification?: string
  quoteOneTime?: number
  specialRequest?: string
}

const LeadNotificationEmail = ({
  name, email, trade, score, classification, quoteOneTime, specialRequest,
}: LeadNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🔥 New Lead: {name || 'Unknown'} — {trade || 'Unknown trade'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>🔥 New Lead Submitted</Heading>
        </Section>
        <Hr style={hr} />
        <Text style={text}>A new lead has been submitted via the calculator:</Text>
        <Section style={detailsBox}>
          <Text style={detailRow}><strong>Name:</strong> {name || '—'}</Text>
          <Text style={detailRow}><strong>Email:</strong> {email || '—'}</Text>
          <Text style={detailRow}><strong>Trade:</strong> {trade || '—'}</Text>
          <Text style={detailRow}><strong>Score:</strong> {score ?? 0}/100 ({classification || 'unscored'})</Text>
          <Text style={detailRow}><strong>Quote:</strong> {quoteOneTime ?? 0} CZK</Text>
          {specialRequest && (
            <Text style={detailRow}><strong>Special Request:</strong> {specialRequest}</Text>
          )}
        </Section>
        <Button style={button} href="https://www.fastmedia.pro/admin/leads">
          View in Admin Dashboard
        </Button>
        <Text style={footer}>— {SITE_NAME} Notification System</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: LeadNotificationEmail,
  subject: (data: Record<string, any>) =>
    `🔥 New Lead: ${data.name || 'Unknown'} (${(data.classification || 'unscored').toUpperCase()}) — ${data.trade || 'Unknown'}`,
  displayName: 'Lead notification (admin)',
  previewData: {
    name: 'Jan Novák',
    email: 'jan@example.com',
    trade: 'Plumbing',
    score: 85,
    classification: 'high_priority',
    quoteOneTime: 45000,
    specialRequest: 'Need SEO optimization included',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { padding: '0 0 8px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 8px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px' }
const detailRow = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 4px' }
const button = {
  backgroundColor: '#0f3a7a', color: '#ffffff', padding: '12px 24px',
  borderRadius: '6px', fontSize: '14px', fontWeight: '600' as const,
  textDecoration: 'none', display: 'inline-block' as const, margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '24px 0 0' }

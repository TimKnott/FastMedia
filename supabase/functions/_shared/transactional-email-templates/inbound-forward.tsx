import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FastMedia.Pro'

interface InboundForwardProps {
  fromAddress?: string
  fromName?: string
  toAddress?: string
  subject?: string
  bodyPlain?: string
  aiReply?: string
  status?: string
}

const InboundForwardEmail = ({
  fromAddress, fromName, toAddress, subject, bodyPlain, aiReply, status,
}: InboundForwardProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>📨 Inbound: {subject || '(no subject)'} from {fromName || fromAddress}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>📨 New Inbound Message</Heading>
        </Section>
        <Hr style={hr} />
        <Section style={detailsBox}>
          <Text style={detailRow}><strong>From:</strong> {fromName ? `${fromName} <${fromAddress}>` : fromAddress || '—'}</Text>
          <Text style={detailRow}><strong>To:</strong> {toAddress || '—'}</Text>
          <Text style={detailRow}><strong>Subject:</strong> {subject || '(no subject)'}</Text>
          <Text style={detailRow}><strong>Status:</strong> {status || 'received'}</Text>
        </Section>
        <Heading as="h2" style={h2}>Message</Heading>
        <Text style={bodyText}>{bodyPlain || '(empty body)'}</Text>
        {aiReply ? (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>AI Auto-reply Sent</Heading>
            <Text style={bodyText}>{aiReply}</Text>
          </>
        ) : null}
        <Button style={button} href="https://www.fastmedia.pro/admin/emails">
          Open Inbox
        </Button>
        <Text style={footer}>— {SITE_NAME} Inbox Forwarder</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InboundForwardEmail,
  subject: (data: Record<string, any>) =>
    `📨 [Inbox] ${data.subject || '(no subject)'} — ${data.fromName || data.fromAddress || 'unknown'}`,
  displayName: 'Inbound message forward (admin)',
  previewData: {
    fromAddress: 'jane@example.com',
    fromName: 'Jane Customer',
    toAddress: 'support@fastmedia.pro',
    subject: 'Quote enquiry',
    bodyPlain: 'Hi, can you give me a quote for a 5-page website?',
    aiReply: 'Hi Jane, happy to help — please use our calculator at fastmedia.pro/calculator…',
    status: 'replied',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '600px', margin: '0 auto' }
const headerSection = { padding: '0 0 8px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 8px' }
const h2 = { fontSize: '15px', fontWeight: '600' as const, color: '#0f3a7a', margin: '16px 0 8px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const detailsBox = { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px' }
const detailRow = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 4px' }
const bodyText = { fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: '0 0 16px', whiteSpace: 'pre-wrap' as const }
const button = {
  backgroundColor: '#0f3a7a', color: '#ffffff', padding: '12px 24px',
  borderRadius: '6px', fontSize: '14px', fontWeight: '600' as const,
  textDecoration: 'none', display: 'inline-block' as const, margin: '16px 0 24px',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '24px 0 0' }

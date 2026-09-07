/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FastMedia.Pro'

interface ContactEnquiryProps {
  kind?: string
  name?: string
  email?: string
  phone?: string
  company?: string
  message?: string
  details?: Record<string, string>
  enquiryId?: string
}

const Row = ({ label, value }: { label: string; value?: string }) =>
  value ? <Text style={detailRow}><strong>{label}:</strong> {value}</Text> : null

const ContactEnquiryEmail = ({
  kind, name, email, phone, company, message, details, enquiryId,
}: ContactEnquiryProps) => {
  const isQuote = kind === 'quote'
  const extra = details && typeof details === 'object' ? details : {}
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{isQuote ? 'New quote request' : 'New contact enquiry'} from {name || 'a visitor'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>{isQuote ? 'New quote request' : 'New contact enquiry'}</Heading>
          </Section>
          <Hr style={hr} />
          <Section style={detailsBox}>
            <Row label="Name" value={name} />
            <Row label="Email" value={email} />
            <Row label="Phone" value={phone} />
            <Row label="Company" value={company} />
            {Object.entries(extra).map(([k, v]) => (
              <Row key={k} label={k} value={typeof v === 'string' ? v : String(v)} />
            ))}
          </Section>
          {message && (
            <Section style={messageBox}>
              <Text style={detailRow}><strong>Message</strong></Text>
              <Text style={text}>{message}</Text>
            </Section>
          )}
          {email && (
            <Button style={button} href={`mailto:${email}`}>Reply to {name || 'sender'}</Button>
          )}
          <Text style={footer}>
            <Link style={link} href="https://www.fastmedia.pro/admin/enquiries">Open the admin inbox</Link>
            {enquiryId ? ` · Reference ${enquiryId}` : ''}
          </Text>
          <Text style={footer}>— {SITE_NAME} notifications</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ContactEnquiryEmail,
  subject: (data: Record<string, any>) =>
    `${data.kind === 'quote' ? 'Quote request' : 'Contact enquiry'}: ${data.name || 'Website visitor'}`,
  displayName: 'Contact / quote enquiry (admin)',
  previewData: {
    kind: 'quote',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+420 000 000 000',
    company: 'Smith Plumbing',
    message: 'We need a new website with online booking before the spring season.',
    details: { Budget: '30,000–60,000 CZK', Timeline: '4–6 weeks' },
    enquiryId: '00000000-0000-0000-0000-000000000000',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '600px' }
const headerSection = { paddingBottom: '4px' }
const h1 = { fontSize: '22px', color: '#0f172a', margin: '0 0 8px' }
const hr = { borderColor: '#e2e8f0', margin: '16px 0' }
const detailsBox = { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px 16px' }
const messageBox = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginTop: '12px' }
const detailRow = { fontSize: '14px', color: '#0f172a', margin: '4px 0' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '22px', margin: '4px 0', whiteSpace: 'pre-wrap' as const }
const button = { backgroundColor: '#f43f5e', color: '#ffffff', borderRadius: '8px', padding: '11px 20px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginTop: '18px' }
const footer = { fontSize: '12px', color: '#64748b', marginTop: '18px' }
const link = { color: '#f43f5e' }

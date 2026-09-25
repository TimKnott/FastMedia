import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FastMedia.Pro"

interface AdminNewsletterNotificationProps {
  subscriberEmail?: string
  subscribedAt?: string
  totalSubscribers?: number
}

const AdminNewsletterNotification = ({
  subscriberEmail, subscribedAt, totalSubscribers,
}: AdminNewsletterNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>📨 New newsletter subscriber: {subscriberEmail || 'someone'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>📨 New Newsletter Subscriber</Heading>
        </Section>
        <Hr style={hr} />
        <Text style={text}>A new visitor has subscribed to the FastMedia.Pro newsletter.</Text>
        <Section style={detailsBox}>
          <Text style={detailRow}><strong>Email:</strong> {subscriberEmail || '—'}</Text>
          <Text style={detailRow}><strong>Subscribed at:</strong> {subscribedAt || '—'}</Text>
          {typeof totalSubscribers === 'number' && (
            <Text style={detailRow}><strong>Total subscribers:</strong> {totalSubscribers}</Text>
          )}
        </Section>
        <Button style={button} href="https://www.fastmedia.pro/admin/newsletter">
          View subscribers
        </Button>
        <Text style={footer}>— {SITE_NAME} Notification System</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewsletterNotification,
  subject: (data: Record<string, any>) =>
    `📨 New newsletter subscriber: ${data.subscriberEmail || 'someone'}`,
  displayName: 'Admin newsletter notification',
  previewData: {
    subscriberEmail: 'jane@example.com',
    subscribedAt: '20/04/2026 18:42',
    totalSubscribers: 247,
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

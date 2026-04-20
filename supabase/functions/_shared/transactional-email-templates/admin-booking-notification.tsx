import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FastMedia.Pro"

interface AdminBookingNotificationProps {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  service?: string
  scheduledAt?: string
  durationMinutes?: number
  notes?: string
  assignedTo?: string
}

const AdminBookingNotification = ({
  customerName, customerEmail, customerPhone, service,
  scheduledAt, durationMinutes, notes, assignedTo,
}: AdminBookingNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>📅 New booking: {customerName || 'Customer'} — {service || 'Service'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>📅 New Booking Received</Heading>
        </Section>
        <Hr style={hr} />
        <Text style={text}>A new booking has been added to the calendar:</Text>
        <Section style={detailsBox}>
          <Text style={detailRow}><strong>Customer:</strong> {customerName || '—'}</Text>
          <Text style={detailRow}><strong>Email:</strong> {customerEmail || '—'}</Text>
          {customerPhone && <Text style={detailRow}><strong>Phone:</strong> {customerPhone}</Text>}
          <Text style={detailRow}><strong>Service:</strong> {service || '—'}</Text>
          <Text style={detailRow}><strong>When:</strong> {scheduledAt || '—'}</Text>
          <Text style={detailRow}><strong>Duration:</strong> {durationMinutes ?? 60} minutes</Text>
          {assignedTo && <Text style={detailRow}><strong>Assigned to:</strong> {assignedTo}</Text>}
          {notes && <Text style={detailRow}><strong>Notes:</strong> {notes}</Text>}
        </Section>
        <Button style={button} href="https://fastmedia.pro/admin/bookings">
          Open booking in admin
        </Button>
        <Text style={footer}>— {SITE_NAME} Notification System</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminBookingNotification,
  subject: (data: Record<string, any>) =>
    `📅 New booking: ${data.customerName || 'Customer'} — ${data.service || 'Service'}`,
  displayName: 'Admin booking notification',
  previewData: {
    customerName: 'Sarah Davies',
    customerEmail: 'sarah@example.com',
    customerPhone: '+44 7926 400060',
    service: 'Discovery call — TikTok ads strategy',
    scheduledAt: '24/04/2026 14:00',
    durationMinutes: 45,
    assignedTo: 'Tim Knott',
    notes: 'Wants to discuss their Q2 campaign launch.',
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

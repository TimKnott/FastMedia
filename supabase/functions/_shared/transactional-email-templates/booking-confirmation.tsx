import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FastMedia.Pro"

interface BookingConfirmationProps {
  customerName?: string
  service?: string
  scheduledAt?: string
  durationMinutes?: number
  assignedTo?: string
  notes?: string
}

const BookingConfirmationEmail = ({
  customerName, service, scheduledAt, durationMinutes, assignedTo, notes,
}: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>📅 Your booking for {service || 'our service'} is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>📅 Booking Confirmed</Heading>
        </Section>
        <Hr style={hr} />
        <Text style={text}>
          {customerName ? `Hi ${customerName},` : 'Hello,'} your booking has been confirmed!
        </Text>
        <Section style={detailsBox}>
          <Text style={detailRow}><strong>Service:</strong> {service || '—'}</Text>
          <Text style={detailRow}><strong>Date:</strong> {scheduledAt || '—'}</Text>
          <Text style={detailRow}><strong>Duration:</strong> {durationMinutes ?? 60} minutes</Text>
          {assignedTo && <Text style={detailRow}><strong>Assigned to:</strong> {assignedTo}</Text>}
          {notes && <Text style={detailRow}><strong>Notes:</strong> {notes}</Text>}
        </Section>
        <Text style={text}>
          If you need to reschedule or cancel, please contact us as soon as possible.
        </Text>
        <Button style={button} href="https://fastmedia.pro">
          Visit {SITE_NAME}
        </Button>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `📅 Booking Confirmed: ${data.service || 'Your appointment'}`,
  displayName: 'Booking confirmation',
  previewData: {
    customerName: 'Max Mustermann',
    service: 'Web Development Consultation',
    scheduledAt: '15.01.2026, 14:00',
    durationMinutes: 60,
    assignedTo: 'Tim Knott',
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

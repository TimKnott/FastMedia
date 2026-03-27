import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FastMedia.Pro"

interface KanbanTaskAssignmentProps {
  recipientName?: string
  customerName?: string
  service?: string
  status?: string
  scheduledAt?: string
  notes?: string
  assignedBy?: string
}

const KanbanTaskAssignmentEmail = ({
  recipientName, customerName, service, status, scheduledAt, notes, assignedBy,
}: KanbanTaskAssignmentProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>📋 Task assigned: {customerName || 'New booking'} — {service || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>📋 Task Assigned to You</Heading>
        </Section>
        <Hr style={hr} />
        <Text style={text}>
          {recipientName ? `Hi ${recipientName},` : 'Hello,'} a booking task has been
          assigned to you{assignedBy ? ` by ${assignedBy}` : ''}.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailRow}><strong>Customer:</strong> {customerName || '—'}</Text>
          <Text style={detailRow}><strong>Service:</strong> {service || '—'}</Text>
          <Text style={detailRow}><strong>Status:</strong> {status || '—'}</Text>
          {scheduledAt && <Text style={detailRow}><strong>Scheduled:</strong> {scheduledAt}</Text>}
          {notes && <Text style={detailRow}><strong>Notes:</strong> {notes}</Text>}
        </Section>
        <Button style={button} href="https://fastmedia.pro/admin/bookings">
          View in Admin Dashboard
        </Button>
        <Text style={footer}>— {SITE_NAME} Task System</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: KanbanTaskAssignmentEmail,
  subject: (data: Record<string, any>) =>
    `📋 Task Assigned: ${data.customerName || 'Booking'} — ${data.service || 'Service'}`,
  displayName: 'Kanban task assignment',
  previewData: {
    recipientName: 'Tim',
    customerName: 'Jan Novák',
    service: 'Website Redesign',
    status: 'Bestätigt',
    scheduledAt: '20.01.2026, 10:00',
    notes: 'Client needs responsive design',
    assignedBy: 'Admin',
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

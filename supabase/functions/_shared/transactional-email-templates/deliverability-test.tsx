/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  probeId?: string
  triggeredBy?: string
  triggeredAt?: string
  note?: string
}

const Email = ({ probeId, triggeredBy, triggeredAt, note }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>FastMedia.Pro deliverability probe {probeId ?? ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Deliverability probe</Heading>
        <Text style={p}>
          This is an automated deliverability test sent from the FastMedia.Pro admin panel.
          If you're reading this in your inbox, outbound mail from
          <strong> notify.fastmedia.pro </strong> is reaching this recipient successfully.
        </Text>
        <Hr style={hr} />
        <Section>
          <Text style={meta}><strong>Probe ID:</strong> {probeId ?? '—'}</Text>
          <Text style={meta}><strong>Triggered by:</strong> {triggeredBy ?? '—'}</Text>
          <Text style={meta}><strong>Triggered at:</strong> {triggeredAt ?? '—'}</Text>
          {note ? <Text style={meta}><strong>Note:</strong> {note}</Text> : null}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Safe to ignore or delete. Sent by FastMedia.Pro admin → Email Deliverability.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `FastMedia.Pro deliverability probe ${d?.probeId ?? ''}`.trim(),
  displayName: 'Deliverability test',
  previewData: {
    probeId: 'probe_abc123',
    triggeredBy: 'admin@fastmedia.pro',
    triggeredAt: new Date().toISOString(),
    note: 'Preview only.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '28px 24px' }
const h1 = { color: '#0f172a', fontSize: '22px', margin: '0 0 12px 0' }
const p = { color: '#334155', fontSize: '15px', lineHeight: '22px', margin: '0 0 16px 0' }
const meta = { color: '#334155', fontSize: '13px', lineHeight: '20px', margin: '4px 0' }
const hr = { borderColor: '#e2e8f0', margin: '20px 0' }
const footer = { color: '#64748b', fontSize: '12px', margin: '12px 0 0 0' }

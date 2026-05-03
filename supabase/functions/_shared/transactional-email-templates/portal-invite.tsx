import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FastMedia.Pro'

interface PortalInviteProps {
  recipientName?: string
  projectName?: string
  portalUrl?: string
}

const PortalInvite = ({ recipientName, projectName, portalUrl }: PortalInviteProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your private project preview: ${projectName || 'your website'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{recipientName ? `Hi ${recipientName},` : 'Hello,'}</Heading>
        <Text style={text}>
          Your private preview for <strong>{projectName || 'your project'}</strong> is ready to review.
          Click the button below to open it. You can leave sticky-note feedback anywhere on the page.
        </Text>
        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={portalUrl} style={btn}>Open my project</Button>
        </Section>
        <Text style={small}>
          This link is private to you. Don't share it — anyone who has it can view your preview.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>— {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PortalInvite,
  subject: (d: Record<string, any>) => `Your private preview: ${d.projectName || 'your project'}`,
  displayName: 'Client portal invite',
  previewData: {
    recipientName: 'Alex',
    projectName: 'Acme Plumbing website',
    portalUrl: 'https://fastmedia.pro/portal/abc123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const btn = {
  backgroundColor: '#0f3a7a', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontWeight: '600' as const, textDecoration: 'none', fontSize: '14px',
}
const small = { fontSize: '12px', color: '#6b7280', lineHeight: '1.6', margin: '12px 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#6b7280', margin: '0' }

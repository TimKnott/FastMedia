import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FastMedia.Pro'

interface PortalInviteProps {
  recipientName?: string
  projectName?: string
  portalUrl?: string
}

const STEPS: Array<{ title: string; body: string }> = [
  {
    title: 'Open the link',
    body: 'Tap the “Open my project” button above. It works on phone, tablet, or computer — no password or login needed.',
  },
  {
    title: 'Browse your preview',
    body: 'You will see your live website preview, exactly as visitors will. Scroll through every page and click around to test it.',
  },
  {
    title: 'Leave sticky-note feedback',
    body: 'Click anywhere on the page to drop a coloured sticky note with a comment. Use it to flag changes, ask questions, or approve sections — just like leaving notes on a printed page.',
  },
  {
    title: 'Track progress',
    body: 'Your notes appear on a kanban board (To do → In progress → Done) so you can watch us work through every change in real time.',
  },
  {
    title: 'Approve & sign off',
    body: 'When you are happy, tick the agreement box at the top of the portal. That confirms sign-off and tells us we are clear to launch.',
  },
]

const PortalInvite = ({ recipientName, projectName, portalUrl }: PortalInviteProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your private project preview: ${projectName || 'your website'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{recipientName ? `Hi ${recipientName},` : 'Hello,'}</Heading>
        <Text style={text}>
          Your private preview for <strong>{projectName || 'your project'}</strong> is ready to review.
          Open it below and leave us feedback directly on the page — no apps to install, no account to create.
        </Text>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={portalUrl} style={btn}>Open my project</Button>
        </Section>

        <Text style={small}>
          🔒 This link is private to you. Anyone who has it can view your preview, so please don’t forward it.
        </Text>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>How to access your project</Heading>
        <Text style={text}>Five short steps — most clients are done in under two minutes.</Text>

        <Section style={stepsBox}>
          {STEPS.map((s, i) => (
            <Row key={i} style={{ marginBottom: i === STEPS.length - 1 ? 0 : '14px' }}>
              <Column style={stepNumCol}>
                <div style={stepNum}>{i + 1}</div>
              </Column>
              <Column>
                <Text style={stepTitle}>{s.title}</Text>
                <Text style={stepBody}>{s.body}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Section style={tipBox}>
          <Text style={tipTitle}>💡 Tip</Text>
          <Text style={tipBody}>
            Bookmark the link in your browser so you can pop back any time to see the latest changes
            and check on your feedback.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Stuck or unsure? Just reply to this email and a real person will help you within a few hours.
        </Text>
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
    portalUrl: 'https://www.fastmedia.pro/portal/abc123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 12px' }
const h2 = { fontSize: '16px', fontWeight: '700' as const, color: '#0f3a7a', margin: '24px 0 8px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 14px' }
const btn = {
  backgroundColor: '#0f3a7a', color: '#ffffff', padding: '12px 28px',
  borderRadius: '8px', fontWeight: '600' as const, textDecoration: 'none', fontSize: '14px',
}
const small = { fontSize: '12px', color: '#6b7280', lineHeight: '1.6', margin: '12px 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#6b7280', margin: '0' }

const stepsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '18px 18px 18px 14px',
  margin: '8px 0 18px',
}
const stepNumCol = { width: '38px', verticalAlign: 'top' as const }
const stepNum = {
  width: '26px', height: '26px', borderRadius: '50%',
  backgroundColor: '#0f3a7a', color: '#ffffff',
  fontSize: '13px', fontWeight: 700, lineHeight: '26px',
  textAlign: 'center' as const, marginTop: '2px',
}
const stepTitle = {
  fontSize: '14px', fontWeight: 600, color: '#0f172a',
  margin: '0 0 2px', lineHeight: '1.4',
}
const stepBody = {
  fontSize: '13px', color: '#475569', lineHeight: '1.55', margin: 0,
}

const tipBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: '10px',
  padding: '14px 16px',
  margin: '4px 0 8px',
}
const tipTitle = { fontSize: '13px', fontWeight: 700, color: '#9a3412', margin: '0 0 4px' }
const tipBody = { fontSize: '13px', color: '#7c2d12', lineHeight: '1.55', margin: 0 }

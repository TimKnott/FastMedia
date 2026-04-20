import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'FastMedia.Pro'

interface AIReplyProps {
  recipientName?: string
  originalSubject?: string
  aiReply?: string
}

const AIInboundReply = ({ recipientName, originalSubject, aiReply }: AIReplyProps) => {
  const paragraphs = (aiReply || '').split(/\n{2,}/).filter(Boolean)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Re: ${originalSubject || 'your message'}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {recipientName ? `Hi ${recipientName},` : 'Hello,'}
          </Heading>
          <Text style={text}>
            Thanks for getting in touch with {SITE_NAME}. Here's a quick reply to your message:
          </Text>
          <Section style={replyBox}>
            {paragraphs.length > 0
              ? paragraphs.map((p, i) => <Text key={i} style={replyText}>{p}</Text>)
              : <Text style={replyText}>{aiReply}</Text>}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            A member of our team will follow up personally if your enquiry needs deeper attention.
            <br />— {SITE_NAME} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AIInboundReply,
  subject: (data: Record<string, any>) =>
    data.originalSubject ? `Re: ${data.originalSubject}` : `Re: your message to ${SITE_NAME}`,
  displayName: 'AI inbound reply',
  previewData: {
    recipientName: 'Alex',
    originalSubject: 'Question about pricing',
    aiReply:
      'Thanks for asking about our pricing. Our packages start at 4,990 Kč for the Starter plan and scale up to enterprise tiers.\n\nIf you can share a few details about your trade and the features you need, I can point you to the right package.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const replyBox = { backgroundColor: '#f8fafc', borderLeft: '3px solid #0f3a7a', borderRadius: '4px', padding: '14px 18px', margin: '0 0 20px' }
const replyText = { fontSize: '14px', color: '#1f2937', lineHeight: '1.7', margin: '0 0 12px' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#6b7280', lineHeight: '1.6', margin: '0' }

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FastMedia.Pro"

interface NewsletterWelcomeProps {
  email?: string
}

const NewsletterWelcomeEmail = ({ email }: NewsletterWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — you're subscribed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>📬 Welcome to {SITE_NAME}!</Heading>
        </Section>
        <Hr style={hr} />
        <Text style={text}>
          Thank you for subscribing! You'll receive updates about web development tips,
          industry insights, and exclusive offers for your business.
        </Text>
        <Text style={text}>
          We help tradespeople and small businesses build professional websites that
          generate real leads. Stay tuned for valuable content.
        </Text>
        <Button style={button} href="https://fastmedia.pro/blog">
          Read Our Blog
        </Button>
        <Text style={footer}>
          You're receiving this because {email || 'you'} subscribed to our newsletter.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewsletterWelcomeEmail,
  subject: `Welcome to ${SITE_NAME}! 📬`,
  displayName: 'Newsletter welcome',
  previewData: { email: 'subscriber@example.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { padding: '0 0 8px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 8px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const button = {
  backgroundColor: '#e8571a', color: '#ffffff', padding: '12px 24px',
  borderRadius: '6px', fontSize: '14px', fontWeight: '600' as const,
  textDecoration: 'none', display: 'inline-block' as const, margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '24px 0 0' }

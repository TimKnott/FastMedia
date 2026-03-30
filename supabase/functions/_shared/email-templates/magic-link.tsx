/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

const LOGO_URL = 'https://aivnnjsrupmubcjsgulb.supabase.co/storage/v1/object/public/site-images/email%2Flogo.jpeg'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Ihr Login-Link für {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="140" height="auto" alt={siteName} style={logo} />
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Ihr Login-Link</Heading>
        <Text style={text}>
          Klicken Sie auf die Schaltfläche unten, um sich bei {siteName} anzumelden.
          Dieser Link läuft in Kürze ab.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Anmelden
        </Button>
        <Text style={footer}>
          Falls Sie diesen Link nicht angefordert haben, können Sie diese E-Mail ignorieren.
        </Text>
        <Text style={brandFooter}>— {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { padding: '0 0 8px' }
const logo = { borderRadius: '8px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px' }
const button = {
  backgroundColor: '#0f3a7a', color: '#ffffff', fontSize: '14px', fontWeight: '600' as const,
  borderRadius: '0.75rem', padding: '12px 24px', textDecoration: 'none',
  display: 'inline-block' as const, margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '24px 0 0' }
const brandFooter = { fontSize: '12px', color: '#9ca3af', margin: '8px 0 0' }

/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Ihr Bestätigungscode</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="140" height="auto" alt="FastMedia.Pro" style={logo} />
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Identität bestätigen</Heading>
        <Text style={text}>
          Verwenden Sie den folgenden Code, um Ihre Identität zu bestätigen:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Dieser Code läuft in Kürze ab. Falls Sie ihn nicht angefordert haben,
          können Sie diese E-Mail ignorieren.
        </Text>
        <Text style={brandFooter}>— FastMedia.Pro</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { padding: '0 0 8px' }
const logo = { borderRadius: '8px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = {
  fontFamily: "'Space Grotesk', Courier, monospace", fontSize: '28px',
  fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 30px', letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '24px 0 0' }
const brandFooter = { fontSize: '12px', color: '#9ca3af', margin: '8px 0 0' }

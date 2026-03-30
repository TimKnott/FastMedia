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
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

const LOGO_URL = 'https://aivnnjsrupmubcjsgulb.supabase.co/storage/v1/object/public/site-images/email%2Flogo.jpeg'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Bestätigen Sie Ihre E-Mail für {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="140" height="auto" alt={siteName} style={logo} />
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>E-Mail bestätigen</Heading>
        <Text style={text}>
          Vielen Dank für Ihre Registrierung bei{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Bitte bestätigen Sie Ihre E-Mail-Adresse (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ), indem Sie auf die Schaltfläche unten klicken:
        </Text>
        <Button style={button} href={confirmationUrl}>
          E-Mail bestätigen
        </Button>
        <Text style={footer}>
          Falls Sie kein Konto erstellt haben, können Sie diese E-Mail ignorieren.
        </Text>
        <Text style={brandFooter}>— {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { padding: '0 0 8px' }
const logo = { borderRadius: '8px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0f3a7a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#0f3a7a', textDecoration: 'underline' }
const button = {
  backgroundColor: '#0f3a7a', color: '#ffffff', fontSize: '14px', fontWeight: '600' as const,
  borderRadius: '0.75rem', padding: '12px 24px', textDecoration: 'none',
  display: 'inline-block' as const, margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#9ca3af', margin: '24px 0 0' }
const brandFooter = { fontSize: '12px', color: '#9ca3af', margin: '8px 0 0' }

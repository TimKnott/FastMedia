import { ORG_AREA_SERVED, ORG_PORTFOLIO } from '@/lib/orgSchema';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAllSiteSettings } from '@/hooks/useSiteSettings';

const HomeJsonLd = () => {
  const { t } = useLanguage();
  const { isEnabled } = useAllSiteSettings();

  const faqItems = ['1', '2', '3', '4', '5', '6', '7', '8'].map((k) => ({
    '@type': 'Question' as const,
    name: t(`faq.q${k}`),
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: t(`faq.a${k}`),
    },
  }));

  const organizationSchema = { ...{
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://www.fastmedia.pro/#organization",
    name: "FastMedia.Pro",
    url: "https://www.fastmedia.pro/",
    logo: "https://www.fastmedia.pro/favicon.jpeg",
    image: "https://www.fastmedia.pro/pwa-512x512.png",
    email: "support@fastmedia.pro",
    telephone: "+420797864432",
    founder: { "@type": "Person", name: "Timothy Knott" },
    taxID: "17308551",
    identifier: { "@type": "PropertyValue", propertyID: "IČO", value: "17308551" },
    address: { "@type": "PostalAddress", addressLocality: "Louny", postalCode: "440 01", addressRegion: "Ústecký kraj", addressCountry: "CZ" },
    areaServed: ORG_AREA_SERVED,
  subjectOf: ORG_PORTFOLIO,
    knowsLanguage: ["bg","hr","cs","da","nl","en","et","fi","fr","de","el","hu","ga","it","lv","lt","mt","pl","pt","ro","sk","sl","es","sv"],
    contactPoint: { "@type": "ContactPoint", telephone: "+420797864432", email: "support@fastmedia.pro", contactType: "sales", availableLanguage: ["cs", "en"] },
  }, description: t('hero.subtitle') };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FastMedia.Pro',
    url: 'https://www.fastmedia.pro',
    description: t('hero.subtitle'),
    inLanguage: ['cs', 'en', 'de'],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('hero.title'),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-subtitle', '.faq-section'],
    },
    url: 'https://www.fastmedia.pro',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {isEnabled('home_faq', true) && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
    </>
  );
};

export default HomeJsonLd;

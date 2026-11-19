import { orgJsonLd } from '@/lib/orgSchema';
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

  const organizationSchema = { ...orgJsonLd, description: t('hero.subtitle') };

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

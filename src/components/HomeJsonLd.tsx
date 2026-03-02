import { useLanguage } from '@/contexts/LanguageContext';

const HomeJsonLd = () => {
  const { t } = useLanguage();

  const faqItems = ['1', '2', '3', '4', '5', '6', '7', '8'].map((k) => ({
    '@type': 'Question' as const,
    name: t(`faq.q${k}`),
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: t(`faq.a${k}`),
    },
  }));

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FastMedia.Pro',
    url: 'https://fastmedia.pro',
    logo: 'https://fastmedia.pro/favicon.jpeg',
    description: t('hero.subtitle'),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: ['cs', 'en', 'de'],
    },
    sameAs: [],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  };

  const products = [
    {
      '@type': 'Product',
      name: 'Starter',
      description: t('pricing.starter.desc'),
      offers: { '@type': 'Offer', price: '15000', priceCurrency: 'CZK', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'Product',
      name: 'Basic',
      description: t('pricing.basic.desc'),
      offers: { '@type': 'Offer', price: '25000', priceCurrency: 'CZK', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'Product',
      name: 'Professional',
      description: t('pricing.pro.desc'),
      offers: { '@type': 'Offer', price: '45000', priceCurrency: 'CZK', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'Product',
      name: 'Enterprise',
      description: t('pricing.enterprise.desc'),
      offers: { '@type': 'Offer', price: '80000', priceCurrency: 'CZK', availability: 'https://schema.org/InStock' },
    },
  ];

  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('pricing.title'),
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: p,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />
    </>
  );
};

export default HomeJsonLd;

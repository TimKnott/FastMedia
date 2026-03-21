import { Helmet } from 'react-helmet-async';
import { usePageSeo } from '@/hooks/usePageSeo';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  /** Page path for DB-driven SEO overrides (e.g. "/" or "/blog") */
  pagePath?: string;
}

const BASE_URL = 'https://fastmedia.pro';

const SEOHead = ({
  title,
  description,
  canonical,
  noindex = false,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  pagePath,
}: SEOHeadProps) => {
  const seo = usePageSeo(pagePath ?? '');

  // DB values override props when available
  const effectiveTitle = (pagePath && seo?.title) || title;
  const effectiveDescription = (pagePath && seo?.description) || description;
  const effectiveOgTitle = (pagePath && seo?.og_title) || ogTitle;
  const effectiveOgDescription = (pagePath && seo?.og_description) || ogDescription;
  const effectiveOgImage = (pagePath && seo?.og_image) || ogImage;
  const effectiveOgType = (pagePath && seo?.og_type) || ogType;
  const effectiveNoindex = (pagePath && seo?.noindex) || noindex;

  const fullTitle = effectiveTitle.includes('FastMedia')
    ? effectiveTitle
    : `${effectiveTitle} | FastMedia.Pro`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={effectiveDescription} />
      {effectiveNoindex && <meta name="robots" content="noindex, nofollow" />}
      {!effectiveNoindex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang for multilingual SEO */}
      {canonicalUrl && <link rel="alternate" hrefLang="cs" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="en" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="de" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      <meta property="og:title" content={effectiveOgTitle || fullTitle} />
      <meta property="og:description" content={effectiveOgDescription || effectiveDescription} />
      <meta property="og:type" content={effectiveOgType} />
      <meta property="og:site_name" content="FastMedia.Pro" />
      <meta property="og:locale" content="cs_CZ" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="de_DE" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {effectiveOgImage && <meta property="og:image" content={effectiveOgImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={effectiveOgTitle || fullTitle} />
      <meta name="twitter:description" content={effectiveOgDescription || effectiveDescription} />
      {effectiveOgImage && <meta name="twitter:image" content={effectiveOgImage} />}
    </Helmet>
  );
};

export default SEOHead;

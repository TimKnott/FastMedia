import { Helmet } from 'react-helmet-async';
import { usePageSeo } from '@/hooks/usePageSeo';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedSchema } from '@/hooks/usePublishedSchema';
import { languageLocales, localizedPath, translatedPaths } from '@/lib/publicLanguage';
import { translatedPageSeo } from '@/lib/publicSeo';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

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

const BASE_URL = 'https://www.fastmedia.pro';

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
  const { language } = useLanguage();
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelectorAll('script[data-seo-static]').forEach(node => node.remove());
  }, [pathname]);
  const localizedSeo = translatedPageSeo(canonical ?? '', language);
  const seo = usePageSeo(pagePath ?? '');
  const { data: schemaBlocks } = usePublishedSchema(pagePath);

  // DB values override props when available
  const effectiveTitle = localizedSeo?.title || (pagePath && seo?.title) || title;
  const effectiveDescription = localizedSeo?.description || (pagePath && seo?.description) || description;
  const effectiveOgTitle = localizedSeo?.title || (pagePath && seo?.og_title) || ogTitle;
  const effectiveOgDescription = localizedSeo?.description || (pagePath && seo?.og_description) || ogDescription;
  const effectiveOgImage = (pagePath && seo?.og_image) || ogImage;
  const effectiveOgType = (pagePath && seo?.og_type) || ogType;
  const effectiveNoindex = (pagePath && seo?.noindex) || noindex;

  const fullTitle = effectiveTitle.includes('FastMedia')
    ? effectiveTitle
    : `${effectiveTitle} | FastMedia.Pro`;
  // Normalize: strip trailing slash (except root) to avoid duplicate-content
  // signals — SiteGuru flagged /path and /path/ as separate URLs.
  const resolvedPath = canonical ?? pagePath ?? pathname;
  const normalizedPath = resolvedPath
    ? resolvedPath === '/'
      ? '/'
      : resolvedPath.replace(/\/+$/, '')
    : undefined;
  const canonicalUrl = normalizedPath ? `${BASE_URL}${localizedPath(normalizedPath, language)}` : undefined;
  const hasTranslations = translatedPaths.some(p => p === normalizedPath);

  // Static head tags are marked data-rh so Helmet replaces them on navigation.
  // Server schema describes the initial page only; remove it when React takes over.

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={effectiveDescription} />
      {effectiveNoindex && <meta name="robots" content="noindex, nofollow" />}
      {!effectiveNoindex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang for multilingual SEO */}
      {hasTranslations && normalizedPath && (['cs', 'en', 'de'] as const).map(lang => <link key={lang} rel="alternate" hrefLang={languageLocales[lang]} href={`${BASE_URL}${localizedPath(normalizedPath, lang)}`} />)}
      {hasTranslations && normalizedPath && <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${localizedPath(normalizedPath, 'cs')}`} />}

      <meta property="og:title" content={effectiveOgTitle || fullTitle} />
      <meta property="og:description" content={effectiveOgDescription || effectiveDescription} />
      <meta property="og:type" content={effectiveOgType} />
      <meta property="og:site_name" content="FastMedia.Pro" />
      <html lang={languageLocales[language]} />
      <meta property="og:locale" content={languageLocales[language].replace('-', '_')} />
      {(['cs', 'en', 'de'] as const).filter(lang => lang !== language).map(lang => <meta key={lang} property="og:locale:alternate" content={languageLocales[lang].replace('-', '_')} />)}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {effectiveOgImage && <meta property="og:image" content={effectiveOgImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={effectiveOgTitle || fullTitle} />
      <meta name="twitter:description" content={effectiveOgDescription || effectiveDescription} />
      {effectiveOgImage && <meta name="twitter:image" content={effectiveOgImage} />}
      {(schemaBlocks ?? []).map((b, i) => (
        <script key={`geo-ld-${i}`} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import HomeJsonLd from './HomeJsonLd';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
vi.mock('@/hooks/useSiteSettings', () => ({
  useAllSiteSettings: () => ({ isEnabled: () => true }),
}));

describe('homepage structured data', () => {
  it('never describes agency packages as merchant products, even when pricing is enabled', () => {
    const html = renderToStaticMarkup(<HomeJsonLd />);
    const schemas = [...html.matchAll(/<script[^>]*>(.*?)<\/script>/g)]
      .map(match => JSON.parse(match[1]));
    expect(schemas.map(schema => schema['@type'])).toEqual([
      'ProfessionalService', 'WebSite', 'FAQPage', 'WebPage',
    ]);
    expect(JSON.stringify(schemas)).not.toContain('"@type":"Product"');
    expect(JSON.stringify(schemas)).not.toContain('"@type":"Offer"');
  });
});
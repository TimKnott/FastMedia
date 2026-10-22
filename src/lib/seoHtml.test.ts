import { describe, it, expect } from 'vitest';
import { applyToTemplate, buildCrawlBody, canonicalPath, isIndexablePath } from '../../scripts/seo-html';
import { getAllRoutes } from '../../scripts/seo-routes';
import { buildHead } from '../../scripts/prerender';

describe('SEO public eligibility rules', () => {
  it('excludes private, authentication and parameter URLs', () => {
    for (const path of ['/admin/seo', '/account', '/grant-portal', '/showcase/demo', '/checkout/success', '/calculator?coupon=FAST20']) expect(isIndexablePath(path)).toBe(false);
    for (const path of ['/business', '/equestrian', '/calculator', '/blog']) expect(isIndexablePath(path)).toBe(true);
  });
  it('keeps translated aliases on their canonical Czech URL', () => {
    expect(canonicalPath('/offer')).toBe('/cs/offer');
    expect(canonicalPath('/contact/')).toBe('/cs/contact');
    expect(canonicalPath('/de/offer')).toBe('/de/offer');
  });
  it('injects meaningful content even when the root has a boot loader', () => {
    const template = '<html><head><meta data-rh="true" name="description" content="old"><link data-rh="true" rel="canonical" href="/"></head><body><div id="root"><div id="fm-boot">Loading</div></div></body></html>';
    const output = applyToTemplate(template, '<link rel="canonical" href="https://www.fastmedia.pro/business">', '<main>20 € monthly service</main>');
    expect(output).toContain('<main>20 € monthly service</main>');
    expect(output.match(/rel="canonical"/g)).toHaveLength(1);
    expect(output).not.toContain('content="old"');
  });
  it('keeps campaigns out of public navigation without hiding their own content', () => {
    const routes = ['/business', '/equestrian', '/calculator'].map(path => ({ path, title: path, description: 'Public page' }));
    const html = buildCrawlBody(routes[0], routes);
    expect(html).not.toContain('href="/equestrian"');
    expect(html).toContain('href="/calculator"');
  });
  it('provides campaign and calculator route-specific content without fabricated fallback claims', async () => {
    const routes = await getAllRoutes();
    for (const path of ['/business', '/equestrian', '/calculator']) {
      const route = routes.find(r => r.path === path);
      expect(route?.contentBlocks?.length).toBeGreaterThan(1);
    }
    expect(JSON.stringify(routes)).not.toContain('92%');
    expect(routes.some(r => r.path === '/grant-portal')).toBe(false);
  });
  it('produces one replaceable self-referencing canonical and valid structured data for each key page', async () => {
    const routes = await getAllRoutes();
    for (const path of ['/business', '/equestrian', '/calculator', '/about', '/case-studies']) {
      const route = routes.find(r => r.path === path);
      if (!route) throw new Error(`Missing ${path}`);
      const head = buildHead(route);
      expect(head).toContain(`href="https://www.fastmedia.pro${path}"`);
      expect(head.match(/rel="canonical"/g)).toHaveLength(1);
      expect(head).toContain('data-rh="true" rel="canonical"');
      for (const match of head.matchAll(/type="application\/ld\+json">([^<]*)<\/script>/g)) expect(() => JSON.parse(match[1])).not.toThrow();
    }
  });
});
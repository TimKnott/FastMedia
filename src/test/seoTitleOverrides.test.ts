import { describe, it, expect, vi } from 'vitest';
import { SEO_TITLE_OVERRIDES, seoTitleOverride } from '@/data/seoTitleOverrides';
import { fitTitle } from '@/lib/seoTitle';

const paths = Object.keys(SEO_TITLE_OVERRIDES);

describe('SEO title overrides', () => {
  it('covers exactly the 31 long database titles', () => {
    expect(paths).toHaveLength(31);
  });
  it('final titles are unique and <= 65 chars', () => {
    const finals = paths.map(p => fitTitle(seoTitleOverride(p, SEO_TITLE_OVERRIDES[p].original)));
    expect(new Set(finals).size).toBe(31);
    for (const t of finals) expect(t.length).toBeLessThanOrEqual(65);
  });
  it('applies only while the stored title matches', () => {
    const p = paths[0];
    expect(seoTitleOverride(p, 'Some other language title')).toBe('Some other language title');
    expect(seoTitleOverride('/blog/unknown', SEO_TITLE_OVERRIDES[p].original)).toBe(SEO_TITLE_OVERRIDES[p].original);
  });
  it('prerender uses the override title but keeps path, H1 and canonical path', async () => {
    const { getAllRoutes } = await import('../../scripts/seo-routes');
    vi.setConfig({ testTimeout: 60000 });
    const routes = await getAllRoutes();
    const found = routes.filter(r => paths.includes(r.path));
    for (const r of found) {
      const o = SEO_TITLE_OVERRIDES[r.path];
      expect(r.title).toBe(fitTitle(o.seo));
      if (r.h1) expect(r.h1).not.toBe(r.title);
    }
  }, 60000);
});

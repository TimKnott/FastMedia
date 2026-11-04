import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://www.fastmedia.pro';

function readSitemap(): string {
  return readFileSync(join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
}

describe('public/sitemap.xml', () => {
  it('includes the canonical /demos URL exactly once', () => {
    const xml = readSitemap();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.filter((l) => l === `${BASE}/demos`)).toHaveLength(1);
  });

  it('lists only canonical, indexable URLs on the primary domain', () => {
    const xml = readSitemap();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(`${BASE}/`)).toBe(true);
      // No cross-origin mirrors, preview subdomains or trailing slashes.
      expect(loc.startsWith('https://id-preview')).toBe(false);
      expect(loc.startsWith('https://fastmedia.lovable.app')).toBe(false);
      // Only the bare homepage may end with a slash.
      expect(loc.endsWith('/') && loc !== `${BASE}/`).toBe(false);
      // Private/admin areas must never be crawlable via the sitemap.
      expect(loc.startsWith(`${BASE}/admin`)).toBe(false);
      expect(loc.startsWith(`${BASE}/quote-assessment`)).toBe(false);
    }
  });

  it('has no duplicate URLs', () => {
    const locs = [...readSitemap().matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs).size).toBe(locs.length);
  });
});

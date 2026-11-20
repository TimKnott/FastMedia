import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import prompts from '../../scripts/search-buyer-prompts.json';

const sitemap = readFileSync('public/sitemap.xml', 'utf8');

describe('buyer query benchmarks', () => {
  it('covers English, Czech, UK and EU buyers with a fixed set', () => {
    const markets = new Set(prompts.map(p => p.market));
    for (const m of ['English', 'Czech Republic', 'United Kingdom', 'European Union']) expect(markets.has(m)).toBe(true);
    expect(prompts).toHaveLength(12);
  });
  it('points every query at an indexable sitemap page', () => {
    for (const p of prompts) expect(sitemap).toContain(`<loc>https://www.fastmedia.pro${p.path}</loc>`);
  });
});

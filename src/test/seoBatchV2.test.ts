import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fitTitle, MAX_TITLE } from '@/lib/seoTitle';
import { ORG_AREA_SERVED, ORG_PORTFOLIO } from '@/lib/orgSchema';

function robotsGroups() {
  const txt = readFileSync('public/robots.txt', 'utf8');
  const groups: Record<string, string[]> = {};
  let agent = '';
  for (const line of txt.split('\n')) {
    const [k, ...v] = line.split(':');
    const val = v.join(':').trim();
    if (/^user-agent$/i.test(k.trim())) { agent = val; groups[agent] = []; }
    else if (agent && /^disallow$/i.test(k.trim())) groups[agent].push(val);
  }
  return groups;
}

describe('private showcase stays blocked', () => {
  it.each(['Googlebot', 'Bingbot', '*'])('%s disallows /showcase/', (ua) => {
    expect(robotsGroups()[ua]).toContain('/showcase/');
  });
  it('no /showcase/ URL in the static sitemap', () => {
    expect(readFileSync('public/sitemap.xml', 'utf8')).not.toMatch(/fastmedia\.pro\/showcase\//);
  });
});

describe('organization schema', () => {
  it('lists the five remote target markets and no EU place', () => {
    expect(ORG_AREA_SERVED.map(a => a.name)).toEqual(['Czech Republic', 'United Kingdom', 'United States', 'Canada', 'Australia']);
  });
  it('references the myname.co.uk portfolio', () => {
    expect(ORG_PORTFOLIO.url).toBe('https://myname.co.uk/');
  });
});

describe('fitTitle', () => {
  it('keeps the brand when it fits', () => {
    expect(fitTitle('Website Demos')).toBe('Website Demos | FastMedia.Pro');
  });
  it('drops the brand rather than exceed the limit', () => {
    const t = fitTitle('A'.repeat(55) + ' | FastMedia.Pro');
    expect(t).toBe('A'.repeat(55));
    expect(t.length).toBeLessThanOrEqual(MAX_TITLE);
  });
});

describe('static route catalogue', () => {
  it('gives translated /offer and /contact an English x-default and all indexable static titles <= 65 chars', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_URL', '');
    const { getAllRoutes } = await import('../../scripts/seo-routes');
    const routes = await getAllRoutes();
    for (const base of ['/offer', '/contact']) {
      const r = routes.find(x => x.path === `/en${base}`)!;
      expect(r.alternates?.find(a => a.language === 'x-default')?.path).toBe(`/en${base}`);
      expect(r.alternates?.map(a => a.language)).toEqual(expect.arrayContaining(['cs-CZ', 'en-GB', 'de-DE']));
    }
    // Database-sourced blog/translation titles are excluded: they cannot be edited here.
    const long = routes.filter(r => !r.noindex && !r.path.startsWith('/blog/') && !r.path.startsWith('/l/') && r.title.length > MAX_TITLE);
    expect(long.map(r => r.path)).toEqual([]);
  }, 30000);
});

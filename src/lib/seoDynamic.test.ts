import { describe, expect, it, vi } from 'vitest';
import { languageAlternatives, safeSeoFetch } from './seoDynamic';

describe('dynamic SEO rules', () => {
  it('keeps other content available when one fetch rejects', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const rows = await Promise.all([
      safeSeoFetch('failed', () => Promise.reject(new Error('unavailable'))),
      safeSeoFetch('published', () => Promise.resolve({ data: [{ slug: 'real-page' }], error: null })),
    ]);
    expect(rows).toEqual([[], [{ slug: 'real-page' }]]);
    warn.mockRestore();
  });
  it('excludes failed API responses instead of treating them as published content', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await safeSeoFetch('failed', () => Promise.resolve({ data: [{ slug: 'private' }], error: { message: 'denied' } }))).toEqual([]);
    warn.mockRestore();
  });
  it('lists only valid published siblings without inventing English source alternatives', () => {
    expect(languageAlternatives([
      { language_code: 'de', slug: 'grant', source_path: '/grant' },
      { language_code: 'fr', slug: 'grant', source_path: '/grant' },
      { language_code: 'es', slug: 'other', source_path: '/other' },
      { language_code: 'de', slug: '../private', source_path: '/grant' },
    ], '/grant')).toEqual([{ language: 'de', path: '/l/de/grant' }, { language: 'fr', path: '/l/fr/grant' }]);
  });
});
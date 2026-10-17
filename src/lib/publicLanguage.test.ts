import { describe, expect, it } from 'vitest';
import { initialLanguage, localizedPath, languageLocales } from './publicLanguage';

describe('public languages', () => {
  it('preserves Czech as the default for new visitors', () => {
    expect(initialLanguage('/', null)).toBe('cs');
    expect(initialLanguage('/', 'invalid')).toBe('cs');
  });
  it.each(['cs', 'en', 'de'] as const)('retains saved %s selection', language => {
    expect(initialLanguage('/', language)).toBe(language);
  });
  it('uses direct German URLs instead of a conflicting saved language', () => {
    expect(initialLanguage('/de/contact', 'en')).toBe('de');
    expect(languageLocales.de).toBe('de-DE');
  });
  it('keeps translated language URLs distinct without rewriting private routes', () => {
    expect(localizedPath('/offer', 'de')).toBe('/de/offer');
    expect(localizedPath('/de/contact', 'en')).toBe('/en/contact');
    expect(localizedPath('/admin', 'de')).toBe('/admin');
  });
});
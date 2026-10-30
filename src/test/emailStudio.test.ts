import { describe, expect, it } from 'vitest';
import { checkEmail, findPlaceholders, guessMapping, parseTable, recommendEmail, renderMerge } from '@/lib/emailStudio';

describe('email studio', () => {
  it('fills merge fields and uses fallbacks', () => {
    const r = renderMerge('Hi {{first_name}} at {{company}}', { company: 'Novák' }, { first_name: 'there' });
    expect(r.text).toBe('Hi there at Novák');
    expect(r.missing).toEqual([]);
  });
  it('reports missing merge fields', () => {
    expect(renderMerge('{{city}}', {}).missing).toEqual(['city']);
  });
  it('parses pasted spreadsheet rows with quotes', () => {
    const t = parseTable('company\tcity\n"Novák, s.r.o."\tLouny');
    expect(t.rows[0]).toEqual({ company: 'Novák, s.r.o.', city: 'Louny' });
    expect(parseTable('a,b\n"x ""y""",2').rows[0].a).toBe('x "y"');
  });
  it('guesses Czech column names', () => {
    expect(guessMapping(['Firma', 'Město', 'Web']).city).toBe('Město');
  });
  it('recommends the no-website template for a site-less business', () => {
    expect(recommendEmail('trades', 'no_site').templateId).toBe('b-no-site');
    expect(recommendEmail('salon', 'unknown').templateId).toBe('b-booking');
  });
  it('lists placeholders once', () => {
    expect(findPlaceholders('{{company}} {{ company }} {{city}}')).toEqual(['company', 'city']);
  });
  it('flags spam words and empty subject', () => {
    expect(checkEmail('', 'Act now, guarantee').issues.length).toBeGreaterThanOrEqual(2);
  });
});

import { describe, it, expect } from 'vitest';
import { parseHours, parseWeeks, buildQuoteInputs, formatMoney } from '@/lib/quoteForm';

describe('parseHours', () => {
  it('accepts decimal hours with comma or dot', () => {
    expect(parseHours('1,5')).toBe(1.5);
    expect(parseHours('2.25')).toBe(2.25);
    expect(parseHours(10)).toBe(10);
  });
  it('rejects zero, negative and non-numeric values', () => {
    expect(parseHours('0')).toBe(0);
    expect(parseHours('-3')).toBe(0);
    expect(parseHours('abc')).toBe(0);
    expect(parseHours(null)).toBe(0);
  });
  it('rounds to quarter hours and caps at 2000', () => {
    expect(parseHours('1.3')).toBe(1.25);
    expect(parseHours('5000')).toBe(2000);
  });
});

describe('parseWeeks', () => {
  it('accepts positive integers and caps at 104', () => {
    expect(parseWeeks(6)).toBe(6);
    expect(parseWeeks('300')).toBe(104);
  });
  it('returns null for empty or invalid values', () => {
    expect(parseWeeks('')).toBeNull();
    expect(parseWeeks(0)).toBeNull();
    expect(parseWeeks(-2)).toBeNull();
  });
});

describe('buildQuoteInputs', () => {
  it('merges duplicate roles and drops invalid lines', () => {
    const inputs = buildQuoteInputs(
      [
        { role: 'web_developer', hours: 10 },
        { role: 'web_developer', hours: 5 },
        { role: 'designer', hours: 0 },
        { role: '', hours: 4 },
      ],
      'CZ',
      8,
    );
    expect(inputs.packages).toHaveLength(1);
    expect(inputs.packages[0]).toMatchObject({ role: 'web_developer', hours: 15 });
    expect(inputs.country).toBe('CZ');
    expect(inputs.weeks).toBe(8);
  });
  it('normalises country codes and treats OTHER as null', () => {
    expect(buildQuoteInputs([{ role: 'qa', hours: 2 }], 'cz', null).country).toBe('CZ');
    expect(buildQuoteInputs([{ role: 'qa', hours: 2 }], 'OTHER', null).country).toBeNull();
    expect(buildQuoteInputs([{ role: 'qa', hours: 2 }], 'xx', null).country).toBe('XX');
  });
});

describe('formatMoney', () => {
  it('formats per locale rules: cs/de dots, en commas', () => {
    expect(formatMoney(123456789, 'CZK', 'cs')).toBe('1.234.568 CZK');
    expect(formatMoney(123456789, 'CZK', 'de')).toBe('1.234.568 CZK');
    expect(formatMoney(123456789, 'CZK', 'en')).toBe('1,234,568 CZK');
  });
  it('renders missing values as a dash', () => {
    expect(formatMoney(null, 'CZK', 'cs')).toBe('—');
  });
});

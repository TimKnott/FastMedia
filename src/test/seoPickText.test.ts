import { describe, it, expect } from 'vitest';
import { pickSeoText } from '@/lib/seoDynamic';

describe('pickSeoText', () => {
  it('falls back past an empty Czech title to the English one', () => {
    expect(pickSeoText({ cs: '', de: '', en: 'Why tradespeople lose leads' })).toEqual({ text: 'Why tradespeople lose leads', key: 'en', language: 'en-GB' });
  });
  it('keeps Czech when present', () => {
    expect(pickSeoText({ cs: 'Ahoj', en: 'Hi' }).key).toBe('cs');
  });
  it('returns empty when no language has text', () => {
    expect(pickSeoText({ cs: ' ', en: '' }).text).toBe('');
  });
});

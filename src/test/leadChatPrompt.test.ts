import { describe, it, expect } from 'vitest';
import { leadChatPrompt } from '@/lib/leadChatPrompt';
describe('leadChatPrompt', () => {
  it('uses only given facts and marks gaps unknown', () => {
    const p = leadChatPrompt({ name: 'Kola Louny', source_url: 'https://x.cz' }, { name: 'Client A', description: 'bike shop' }, { industry: 'bike repairs', location: 'Louny', radius: 50, extra: '' });
    expect(p).toContain('Kola Louny'); expect(p).toContain('Client A'); expect(p).toContain('Louny, 50 km'); expect(p).toContain('website: unknown');
    expect(p).toContain('nothing will be sent automatically');
  });
});

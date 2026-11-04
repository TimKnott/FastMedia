import { describe, it, expect } from 'vitest';
import { aiTaskUrl } from '@/lib/aiActions';
import { prospectFacts } from '@/lib/prospectLinks';

const prompt = (u: string) => decodeURIComponent(u.split('?q=')[1]);
const base = { contact_name: null, email: 'a@b.cz', region: null, trade: null, source: 'manual', notes: null };

describe('Ask AI links', () => {
  it('drops unsafe source and website URLs', () => {
    const f = prospectFacts({ ...base, company: 'Acme', website: 'javascript:alert(1)' }, 'javascript:alert(2)');
    const p = prompt(aiTaskUrl('analyse', 'prospect', f));
    expect(p).not.toContain('javascript:');
    expect(p).not.toContain('Website / listing');
  });
  it('is scoped to the chosen record only', () => {
    const a = prompt(aiTaskUrl('draft', 'prospect', prospectFacts({ ...base, company: 'Alpha', website: 'alpha.cz' })));
    expect(a).toContain('Company: Alpha');
    expect(a).not.toContain('Beta');
  });
  it('every task says not to invent facts or assume intent, and voice does not claim mic access', () => {
    for (const t of ['analyse', 'draft', 'research', 'next', 'voice'] as const) {
      const p = prompt(aiTaskUrl(t, 'opportunity', { Title: 'X' }));
      expect(p).toContain('Do not invent facts');
      expect(p).toContain('Do not assume purchase intent');
    }
    expect(prompt(aiTaskUrl('voice', 'prospect', {}))).not.toMatch(/microphone/i);
  });
});

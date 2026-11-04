import { describe, it, expect } from 'vitest';
import { safeHttpUrl, safeMailto, distinctSourceUrl, prospectChatGptUrl, isDirectoryListing } from '@/lib/prospectLinks';

describe('prospect links', () => {
  it('rejects unsafe or empty URLs', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('')).toBeNull();
    expect(safeHttpUrl('not a url')).toBeNull();
    expect(safeHttpUrl('example.cz')).toBe('https://example.cz/');
  });
  it('detects Firmy.cz listings', () => {
    expect(isDirectoryListing(safeHttpUrl('https://www.firmy.cz/detail/1'))).toBe(true);
  });
  it('mailto only for valid emails', () => {
    expect(safeMailto('a@b.cz')).toBe('mailto:a@b.cz');
    expect(safeMailto('nope')).toBeNull();
  });
  it('does not duplicate the website as source', () => {
    expect(distinctSourceUrl({ source_url: 'https://www.x.cz/' }, 'https://x.cz')).toBeNull();
    expect(distinctSourceUrl({}, 'https://x.cz')).toBeNull();
    expect(distinctSourceUrl({ source_url: 'https://firmy.cz/1' }, 'https://x.cz')).toBe('https://firmy.cz/1');
  });
  it('builds an encoded ChatGPT link with only provided facts', () => {
    const url = prospectChatGptUrl({ company: 'Acme & Co', contact_name: null, email: 'a@b.cz', website: 'https://acme.cz', region: null, trade: null, source: 'manual', notes: null });
    expect(url.startsWith('https://chatgpt.com/?q=')).toBe(true);
    const prompt = decodeURIComponent(url.split('?q=')[1]);
    expect(prompt).toContain('Company: Acme & Co');
    expect(prompt).not.toContain('Contact:');
  });
});

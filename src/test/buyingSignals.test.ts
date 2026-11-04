import { describe, it, expect } from 'vitest';
import { detectSignals, scoreSignals, analyseProspect } from '@/lib/buyingSignals';
import { validateRows, prepareForImport, parseImport } from '@/lib/opportunityImport';
import { readFileSync } from 'fs';

const now = new Date('2026-11-04T12:00:00Z');
const fresh = '2026-10-30T00:00:00Z';
const SRC = 'https://forum.example.com/post/1';

describe('buying signal scoring', () => {
  it('no evidence = not assessed, score 0', () => {
    const r = scoreSignals([], now);
    expect(r.score).toBe(0);
    expect(r.confidence).toBe('not_assessed');
  });
  it('explicit sourced fresh request scores 40, high confidence, labelled request', () => {
    const r = scoreSignals(detectSignals('We are looking for a new website for our bakery', SRC, fresh), now);
    expect(r.score).toBe(40);
    expect(r.intent).toBe('explicit_request');
    expect(r.offers).toContain('website');
  });
  it('explicit phrase without source is downgraded to inferred hypothesis', () => {
    const s = detectSignals('We are looking for a new website', null);
    expect(s[0].tier).toBe('inferred');
    expect(s[0].observed).toBe(false);
    expect(scoreSignals(s, now).confidence).toBe('low');
  });
  it('inferred-only signals are capped at 35 and never claim intent', () => {
    const s = detectSignals('outdated site, no online booking, weak SEO, no contact form, product catalogue without shop', SRC, fresh);
    const r = scoreSignals(s, now);
    expect(r.score).toBeLessThanOrEqual(35);
    expect(r.intent).toBe('inferred_need');
  });
  it('industry match / no website alone is very low', () => {
    expect(scoreSignals(detectSignals('Plumber with no website', SRC, fresh), now).score).toBe(3);
  });
  it('stale request decays to a quarter', () => {
    expect(scoreSignals(detectSignals('need online booking', SRC, '2026-01-01'), now).score).toBe(10);
  });
  it('expired tender scores 0', () => {
    const s = detectSignals('Tender for website delivery', SRC, fresh).map((x) => ({ ...x, deadlineAt: '2026-10-01' }));
    const r = scoreSignals(s, now);
    expect(r.score).toBe(0);
    expect(r.intent).toBe('inferred_need');
  });
  it('unresearched prospect is not assessed even with a website', () => {
    const r = analyseProspect({ website: 'https://firma.cz', research: null, notes: null }).result;
    expect(r.confidence).toBe('not_assessed');
  });
  it('admin notes never become observed evidence', () => {
    const { signals } = analyseProspect({ website: 'https://firma.cz', notes: 'they need online booking' });
    expect(signals.every((s) => !s.observed)).toBe(true);
  });
});

describe('opportunity import validation', () => {
  const base = { title: 'Shop build', kind: 'active_buyer_request', source_type: 'forum_post', source_url: SRC };
  it('rejects rows without source URL', () => {
    expect(validateRows([{ ...base, source_url: '' }])[0].errors).toContain('Missing or invalid source_url');
  });
  it('rejects company website labelled as buyer request', () => {
    expect(validateRows([{ ...base, source_type: 'company_website' }])[0].errors.length).toBe(1);
  });
  it('accepts company website as prospect hypothesis', () => {
    expect(validateRows([{ ...base, kind: 'prospect_hypothesis', source_type: 'company_website' }])[0].errors).toEqual([]);
  });
  it('rejects personal-looking contacts unless business-published', () => {
    expect(validateRows([{ ...base, public_contact_route: 'jan@seznam.cz' }])[0].errors.length).toBe(1);
    expect(validateRows([{ ...base, public_contact_route: 'jan@seznam.cz', contact_published_by_business: 'true' }])[0].errors).toEqual([]);
  });
  it('dedupes same source URL within file', () => {
    const p = validateRows([base, { ...base, source_url: 'https://www.forum.example.com/post/1/' }]);
    expect(p[1].duplicateInFile).toBe(true);
    expect(prepareForImport(p)).toHaveLength(1);
  });
  it('ignores supplied score and recomputes from evidence', () => {
    const out = prepareForImport(validateRows([{ ...base, priority_score: 99, evidence: [] }]));
    expect(out[0].priority_score).toBe(0);
  });
  it('parses CSV with quoted fields', () => {
    const rows = parseImport('title,kind,source_url,risks\n"A, b",prospect_hypothesis,https://x.cz,a|b\n', 'x.csv');
    expect(rows[0]).toMatchObject({ title: 'A, b', risks: ['a', 'b'] });
  });
});

describe('routes and DB boundaries (static)', () => {
  it('opportunity routes are admin-protected', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    expect(app).toMatch(/path="opportunities" element={<ProtectedRoute minRole="admin">/);
    expect(app).toMatch(/path="opportunities\/:id" element={<ProtectedRoute minRole="admin">/);
  });
  it('migration grants nothing to anon and import RPC asserts admin', () => {
    const sql = readFileSync('drizzle/migrations/0023_opportunity_intelligence.sql', 'utf8');
    expect(sql).not.toMatch(/TO anon/);
    expect(sql).toMatch(/repository_assert_admin\(\)/);
    expect(sql).not.toMatch(/INSERT INTO (public\.)?(prospects|outreach_|leads)/);
  });
});

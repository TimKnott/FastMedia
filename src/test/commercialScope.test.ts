import { describe, it, expect } from 'vitest';
import { computeQuote, commercialPriority } from '@/lib/commercialScope';

const base = {
  currency: 'EUR', contingency_pct: 10, margin_pct: 25,
  packages: [{ name: 'Build', role: 'dev', tier: 'standard' as const, hours: 10 }, { name: 'Integrations', role: 'int', tier: 'specialist' as const, hours: 5 }],
  rates_cents: { dev: 5000, int: 9000 },
};
describe('commercial scoping', () => {
  it('uses separate rates per role and computes floor and recommended', () => {
    const q = computeQuote(base);
    expect(q.base_cents).toBe(95000);
    expect(q.floor_cents).toBe(104500);
    expect(q.recommended_cents).toBe(130625);
    expect(q.hours).toEqual({ total: 15, standard: 10, specialist: 5 });
  });
  it('never invents a missing rate', () => {
    const q = computeQuote({ ...base, rates_cents: { dev: 5000 } });
    expect(q.ok).toBe(false);
    expect(q.missing).toContain('rate for role "int"');
  });
  it('no benchmarks = insufficient confidence, ±30% range, competitive never below floor', () => {
    const q = computeQuote(base);
    expect(q.confidence).toBe('insufficient');
    expect(q.competitive_cents).toBeGreaterThanOrEqual(q.floor_cents);
  });
  it('ignores benchmarks without URL/date', () => {
    const q = computeQuote({ ...base, benchmarks: [{ label: 'x', kind: 'advertised_rate', url: '', date: '', low_cents: 1, unit: 'hour' }] });
    expect(q.benchmark.valid).toBe(0);
  });
  it('estimate-only benchmarks do not raise confidence', () => {
    const q = computeQuote({ ...base, benchmarks: [{ label: 'g', kind: 'estimate', url: 'https://a.cz/x', date: '2026-11-01', low_cents: 4000, unit: 'hour' }] });
    expect(q.confidence).toBe('insufficient');
  });
  it('flags buyer budget below floor', () => {
    expect(computeQuote({ ...base, buyer_budget_cents: 50000 }).notes.join()).toMatch(/below the walk-away floor/);
  });
  it('price never lifts an unverified record', () => {
    expect(commercialPriority(20, 'low', computeQuote(base)).score).toBe(20);
  });
  it('verified record gets at most +10', () => {
    const r = commercialPriority(40, 'high', computeQuote(base), 10_000_000_00);
    expect(r.score).toBeLessThanOrEqual(50);
    expect(r.score).toBeGreaterThan(40);
  });
  it('no-bid caps priority at 10', () => {
    expect(commercialPriority(80, 'high', computeQuote({ ...base, no_bid_reason: 'credentials' })).score).toBe(10);
  });
});

import { benchmarksFor } from '@/lib/marketBenchmarks';
describe('country benchmarks', () => {
  it('every stored benchmark is cited and dated', () => {
    for (const b of [...benchmarksFor('DE'), ...benchmarksFor('CZ')]) { expect(b.url).toMatch(/^https:\/\//); expect(b.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); }
  });
  it('day rates convert to hourly at 8h and monthly wages are context only', () => {
    const q = computeQuote({ currency: 'EUR', margin_pct: 20, packages: [{ name: 'Build', role: 'dev', tier: 'standard', hours: 10 }], rates_cents: { dev: 5000 }, benchmarks: benchmarksFor('DE') });
    expect(q.benchmark.hourly_low).toBe(4163); expect(q.benchmark.hourly_high).toBe(8575); expect(q.confidence).toBe('low');
    const cz = computeQuote({ currency: 'CZK', margin_pct: 20, packages: [{ name: 'Build', role: 'dev', tier: 'standard', hours: 10 }], rates_cents: { dev: 5000 }, benchmarks: benchmarksFor('CZ') });
    expect(cz.benchmark.valid).toBe(0); expect(cz.confidence).toBe('insufficient');
  });
  it('other-currency benchmarks are not used', () => {
    const q = computeQuote({ currency: 'CZK', margin_pct: 20, packages: [{ name: 'B', role: 'dev', tier: 'standard', hours: 1 }], rates_cents: { dev: 1 }, benchmarks: benchmarksFor('DE') });
    expect(q.benchmark.valid).toBe(0);
  });
});

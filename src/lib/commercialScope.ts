/**
 * Deterministic commercial scoping for paid opportunities. All outputs are ESTIMATES.
 * No rate is assumed: every hourly rate must be entered by an admin (labelled as a FastMedia assumption).
 * Benchmarks must carry a source URL, date and evidence label. Money in minor units (cents).
 */
export type RoleTier = 'standard' | 'specialist';
export type BenchmarkKind = 'advertised_rate' | 'awarded_value' | 'salary_derived' | 'estimate';

export interface WorkPackage { name: string; role: string; tier: RoleTier; hours: number }
export interface Benchmark { label: string; kind: BenchmarkKind; url: string; date: string; low_cents?: number; high_cents?: number; unit: 'hour' | 'day' | 'project' | 'month'; currency?: string }
export const HOURS_PER_DAY = 8; // assumption used only to convert published day rates to hourly
export interface Commercial {
  currency?: string;
  packages?: WorkPackage[];
  rates_cents?: Record<string, number>; // per role, per hour — FastMedia assumption
  fixed_costs_cents?: number;
  contingency_pct?: number; // e.g. 15
  margin_pct?: number;      // target margin, e.g. 25
  benchmarks?: Benchmark[];
  buyer_budget_cents?: number | null;
  weeks?: number;
  no_bid_reason?: string; // e.g. missing tender credentials, unrealistic deadline
  fx?: { rate: number; source_url: string; date: string; to: string } | null;
}

export const DEFAULT_PACKAGES = ['Discovery', 'Design', 'Build', 'Integrations', 'Content / data migration', 'QA', 'Deployment', 'Handover', 'Project management / support'];

export interface Quote {
  ok: boolean;
  missing: string[];
  lines: { name: string; role: string; tier: RoleTier; hours: number; rate_cents: number; cost_cents: number }[];
  hours: { total: number; standard: number; specialist: number };
  base_cents: number; contingency_cents: number; floor_cents: number;
  competitive_cents: number; recommended_cents: number; premium_cents: number;
  blended_rate_cents: number;
  benchmark: { hourly_low?: number; hourly_high?: number; project_low?: number; project_high?: number; count: number; valid: number };
  confidence: 'insufficient' | 'low' | 'medium';
  notes: string[];
  noBid: boolean;
}

const validBenchmark = (b: Benchmark) => /^https?:\/\/\S+\.\S+/.test(b?.url ?? '') && !!b?.date && !!b?.kind && (b.low_cents != null || b.high_cents != null);

export function computeQuote(c: Commercial): Quote {
  const missing: string[] = []; const notes: string[] = [];
  const pk = (c.packages ?? []).filter((p) => p && p.hours > 0);
  if (!pk.length) missing.push('work packages with hours');
  const lines = pk.map((p) => {
    const rate = c.rates_cents?.[p.role];
    if (rate == null || rate <= 0) missing.push(`rate for role "${p.role}"`);
    return { ...p, rate_cents: rate ?? 0, cost_cents: Math.round((rate ?? 0) * p.hours) };
  });
  const sumH = (t?: RoleTier) => lines.filter((l) => !t || l.tier === t).reduce((a, l) => a + l.hours, 0);
  const labour = lines.reduce((a, l) => a + l.cost_cents, 0);
  const base = labour + (c.fixed_costs_cents ?? 0);
  const cont = Math.round(base * ((c.contingency_pct ?? 0) / 100));
  const floor = base + cont; // walk-away: covers cost + contingency, zero margin
  const margin = (c.margin_pct ?? 0) / 100;
  if (c.margin_pct == null) missing.push('target margin %');
  const recommended = Math.round(floor * (1 + margin));
  const valid = (c.benchmarks ?? []).filter(validBenchmark);
  if ((c.benchmarks ?? []).length > valid.length) notes.push('Benchmarks without URL, date, label or value were ignored.');
  const otherCur = valid.filter((b) => b.currency && c.currency && b.currency !== c.currency);
  if (otherCur.length) notes.push(`Benchmarks in another currency (${[...new Set(otherCur.map((b) => b.currency))].join(', ')}) shown as context only — not converted.`);
  const monthly = valid.filter((b) => b.unit === 'month' && !otherCur.includes(b));
  if (monthly.length) notes.push('Monthly wage benchmarks are context only — not used in the price range.');
  const bm = valid.filter((b) => !otherCur.includes(b) && b.unit !== 'month')
    .map((b) => b.unit === 'day' ? { ...b, unit: 'hour' as const, low_cents: b.low_cents != null ? Math.round(b.low_cents / HOURS_PER_DAY) : undefined, high_cents: b.high_cents != null ? Math.round(b.high_cents / HOURS_PER_DAY) : undefined } : b);
  if (valid.some((b) => b.unit === 'day' && !otherCur.includes(b))) notes.push(`Day rates converted to hourly at ${HOURS_PER_DAY} h/day (assumption).`);
  const pick = (u: 'hour' | 'project', k: 'low_cents' | 'high_cents', f: (...n: number[]) => number) => {
    const v = bm.filter((b) => b.unit === u && b[k] != null).map((b) => b[k] as number);
    return v.length ? f(...v) : undefined;
  };
  const benchmark = { hourly_low: pick('hour', 'low_cents', Math.min), hourly_high: pick('hour', 'high_cents', Math.max), project_low: pick('project', 'low_cents', Math.min), project_high: pick('project', 'high_cents', Math.max), count: (c.benchmarks ?? []).length, valid: bm.length };
  const observed = bm.filter((b) => b.kind !== 'estimate' && b.kind !== 'salary_derived').length;
  const confidence: Quote['confidence'] = observed >= 3 ? 'medium' : observed >= 1 ? 'low' : 'insufficient';
  // Spread widens when evidence is thin; never narrower than ±10 %.
  const spread = confidence === 'medium' ? 0.1 : confidence === 'low' ? 0.2 : 0.3;
  if (confidence === 'insufficient') notes.push('No observed market benchmark — range widened (±30 %) and pricing confidence is insufficient.');
  const competitive = Math.max(floor, Math.round(recommended * (1 - spread)));
  const premium = Math.round(recommended * (1 + spread));
  if (bm.some((b) => b.kind === 'salary_derived')) notes.push('Includes salary-derived benchmarks (adjusted, not market quotes).');
  if (c.buyer_budget_cents != null && c.buyer_budget_cents < floor) notes.push('Stated buyer budget is below the walk-away floor — reduce scope or decline.');
  const total = sumH();
  return {
    ok: !missing.length, missing: [...new Set(missing)], lines,
    hours: { total, standard: sumH('standard'), specialist: sumH('specialist') },
    base_cents: base, contingency_cents: cont, floor_cents: floor,
    competitive_cents: competitive, recommended_cents: recommended, premium_cents: premium,
    blended_rate_cents: total ? Math.round(labour / total) : 0, benchmark, confidence, notes, noBid: !!c.no_bid_reason,
  };
}

/**
 * Commercial adjustment to priority: at most +10, and only when buying evidence is already observed
 * (medium/high confidence) and the quote is complete. Price never lifts a weak/unverified record.
 * A no-bid reason caps the score at 10.
 */
export function commercialPriority(baseScore: number, signalConfidence: string, q: Quote | null, valueCents = 0): { score: number; reason: string } {
  if (q?.noBid) return { score: Math.min(baseScore, 10), reason: 'No-bid: disqualifying condition recorded' };
  if (!q?.ok) return { score: baseScore, reason: 'No complete quote — no commercial adjustment' };
  if (!['medium', 'high'].includes(signalConfidence)) return { score: baseScore, reason: 'Unverified buying evidence — price does not raise priority' };
  const marginOk = q.recommended_cents > q.floor_cents;
  const bonus = !marginOk ? 0 : Math.min(10, Math.round(Math.log10(Math.max(1, valueCents || q.recommended_cents) / 100) * 2));
  return { score: Math.min(100, baseScore + bonus), reason: marginOk ? `+${bonus} for viable margin and value` : 'No margin above floor — no bonus' };
}

export const fmtMoney = (cents: number | undefined, cur = '') =>
  cents == null ? '—' : `${(cents / 100).toLocaleString('en-GB', { maximumFractionDigits: 0 })} ${cur}`.trim();

export function commercialSummary(c: Commercial, q: Quote): string {
  const cur = c.currency ?? '';
  return [
    `Scope: ${q.lines.map((l) => l.name).join(', ') || 'not scoped'}`,
    `Hours (estimate): ${q.hours.total} (${q.hours.standard} standard / ${q.hours.specialist} specialist)`,
    `Benchmark: ${q.benchmark.valid ? `${fmtMoney(q.benchmark.hourly_low, cur)}–${fmtMoney(q.benchmark.hourly_high, cur)}/h; project ${fmtMoney(q.benchmark.project_low, cur)}–${fmtMoney(q.benchmark.project_high, cur)}` : 'insufficient'}`,
    `Quote range (estimate): ${fmtMoney(q.competitive_cents, cur)} – ${fmtMoney(q.premium_cents, cur)}; recommended opening ${fmtMoney(q.recommended_cents, cur)}; floor ${fmtMoney(q.floor_cents, cur)}`,
    `Buyer stated budget: ${c.buyer_budget_cents != null ? fmtMoney(c.buyer_budget_cents, cur) : 'not stated'}`,
    `Delivery: ${c.weeks ? `${c.weeks} weeks` : 'not estimated'} · Pricing confidence: ${q.confidence}`,
  ].join('\n');
}

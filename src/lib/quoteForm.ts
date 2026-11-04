/**
 * Shared helpers for the public/reseller commercial quote assessment (/quote-assessment).
 * Server-side pricing lives in public.quote_compute (SQL); these helpers only build and
 * validate the inputs the form sends, and format money for display.
 */

export const QUOTE_ROLES = ['web_developer', 'designer', 'integration_specialist', 'qa'] as const;
export type QuoteRole = (typeof QUOTE_ROLES)[number];

export interface QuoteLine { role: string; hours: number; name?: string }
export interface QuoteInputs { packages: QuoteLine[]; country: string | null; weeks: number | null }

const MAX_HOURS = 2000;

export function parseHours(raw: unknown): number {
  const text = typeof raw === 'number' ? String(raw) : String(raw ?? '').trim().replace(',', '.');
  const n = Number.parseFloat(text);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.round(n * 4) / 4, MAX_HOURS);
}

export function parseWeeks(raw: unknown): number | null {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(n, 104);
}

/**
 * Builds the JSON inputs for the quote_run RPC: merges duplicate roles, drops
 * zero/invalid hours, normalises the ISO country code (OTHER -> null) and clamps weeks.
 */
export function buildQuoteInputs(lines: QuoteLine[], country: string | null, weeks: unknown): QuoteInputs {
  const merged = new Map<string, QuoteLine>();
  for (const l of lines ?? []) {
    const role = String(l?.role ?? '').trim();
    const hours = parseHours(l?.hours);
    if (!role || hours <= 0) continue;
    const prev = merged.get(role);
    merged.set(role, { role, hours: prev ? Math.min(prev.hours + hours, MAX_HOURS) : hours, name: l.name });
  }
  const c = String(country ?? '').trim().toUpperCase();
  return { packages: [...merged.values()], country: /^[A-Z]{2}$/.test(c) ? c : null, weeks: parseWeeks(weeks) };
}

/** Formats minor units (cents) per the project's locale rule: cs/de use dot thousands separators, en commas. */
export function formatMoney(cents: number | null | undefined, currency: string | null | undefined, lang: string): string {
  if (cents == null) return '—';
  const whole = Math.round(cents / 100);
  const sep = lang === 'en' ? ',' : '.';
  const grouped = String(Math.abs(whole)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const sign = whole < 0 ? '−' : '';
  return currency ? `${sign}${grouped} ${currency}` : `${sign}${grouped}`;
}

/**
 * Conservative, deterministic buying-signal scoring shared by Prospecting and Opportunities.
 * Score = priority/fit (0-100), NOT a probability of purchase. No AI calls; never invents evidence.
 */
import { safeHttpUrl } from './prospectLinks';

export type SignalTier = 'explicit_request' | 'tender' | 'medium' | 'inferred' | 'very_low';
export type Offer =
  | 'website' | 'ecommerce' | 'booking' | 'crm_automation' | 'seo_ai' | 'directory_tool' | 'integrations';

export interface Signal {
  tier: SignalTier;
  label: string;
  evidence: string;
  sourceUrl: string | null;
  observed: boolean;
  observedAt?: string | null;
  deadlineAt?: string | null;
  offers: Offer[];
}

export const TIER_MAX: Record<SignalTier, number> = {
  explicit_request: 40, tender: 35, medium: 20, inferred: 10, very_low: 3,
};

export const OFFER_LABEL: Record<Offer, string> = {
  website: 'New website / redesign', ecommerce: 'E-commerce shop', booking: 'Online booking / calendar',
  crm_automation: 'Enquiry automation / CRM', seo_ai: 'SEO & AI search visibility',
  directory_tool: 'Directory / search / prospecting tool', integrations: 'API / ERP / PIM integrations',
};

interface Rule { tier: SignalTier; label: string; re: RegExp; offers: Offer[] }

// Order matters: first matching rule per label wins.
export const RULES: Rule[] = [
  { tier: 'explicit_request', label: 'Asks for a new website', re: /(looking for|need|seeking|hled[aá]me|potřebujeme|suchen)\b.{0,30}\b(new )?(website|web ?site|webov|webseite)/i, offers: ['website'] },
  { tier: 'explicit_request', label: 'Requests a redesign quote', re: /(website )?redesign (quote|proposal)|quote for (a )?(website|redesign)|redesign(ing)? our (website|site)/i, offers: ['website'] },
  { tier: 'explicit_request', label: 'Needs online booking', re: /(need|looking for|want)\b.{0,20}\b(online )?(booking|reservation|rezervac)/i, offers: ['booking'] },
  { tier: 'explicit_request', label: 'Wants an e-commerce shop', re: /(looking for|need|want)\b.{0,25}\b(e-?commerce|online shop|e-?shop|webshop)/i, offers: ['ecommerce'] },
  { tier: 'explicit_request', label: 'Needs CRM / integration', re: /(need|looking for|want)\b.{0,25}\b(crm|integration|api|erp|pim)/i, offers: ['crm_automation', 'integrations'] },
  { tier: 'explicit_request', label: 'Wants more enquiries / leads', re: /(want|need|looking for)\b.{0,15}\bmore (enquiries|inquiries|leads|customers)/i, offers: ['crm_automation', 'seo_ai'] },
  { tier: 'tender', label: 'Tender / RFP for digital services', re: /\b(tender|rfp|request for proposal|veřejná zakázka|ausschreibung)\b/i, offers: ['website', 'integrations'] },
  { tier: 'medium', label: 'Hiring for web/digital role', re: /(hiring|vacancy|job opening|we are recruiting|přijmeme|hledáme kolegu).{0,40}(web|digital|e-?commerce|marketing|crm)/i, offers: ['website', 'crm_automation'] },
  { tier: 'medium', label: 'New location / expansion', re: /(new (branch|location|store|office)|opening (a|our) (new|second)|expan(d|sion) (to|into)|nová pobočka)/i, offers: ['website', 'seo_ai'] },
  { tier: 'medium', label: 'New product / service launch', re: /(launch(ing|ed)? (a |our )?new (product|service|range|line)|new product line)/i, offers: ['website', 'ecommerce'] },
  { tier: 'medium', label: 'Booking / enquiry pain stated', re: /(missed (calls|enquiries)|too many (calls|emails)|booking by phone only|hard to book)/i, offers: ['booking', 'crm_automation'] },
  { tier: 'inferred', label: 'Outdated / not mobile-friendly site', re: /(outdated|old-fashioned|not mobile|no mobile|non-responsive|zastaral)/i, offers: ['website'] },
  { tier: 'inferred', label: 'Broken or missing enquiry form', re: /(broken (form|contact)|no (contact|enquiry) form)/i, offers: ['crm_automation'] },
  { tier: 'inferred', label: 'No online booking', re: /(no (online )?booking|without (online )?booking)/i, offers: ['booking'] },
  { tier: 'inferred', label: 'Weak SEO / visibility', re: /(weak|poor|no) (seo|visibility|search presence)|not indexed/i, offers: ['seo_ai'] },
  { tier: 'inferred', label: 'Catalogue without a shop', re: /(product catalog(ue)?|price list).{0,40}(no|without) (shop|e-?commerce|ordering)/i, offers: ['ecommerce'] },
  { tier: 'very_low', label: 'No website', re: /\bno website\b|bez webu/i, offers: ['website'] },
  { tier: 'very_low', label: 'Only a social page', re: /only (a )?(facebook|instagram|social) (page|profile)/i, offers: ['website'] },
];

const snippet = (text: string, idx: number) => text.slice(Math.max(0, idx - 60), idx + 100).replace(/\s+/g, ' ').trim();

/** Detect signals in a text. Matches only count as observed when a real source URL is given. */
export function detectSignals(text: string, sourceUrl: string | null, observedAt?: string | null): Signal[] {
  if (!text?.trim()) return [];
  const src = safeHttpUrl(sourceUrl);
  const seen = new Set<string>();
  const out: Signal[] = [];
  for (const rule of RULES) {
    const m = rule.re.exec(text);
    if (!m || seen.has(rule.label)) continue;
    seen.add(rule.label);
    // Strong tiers without a source are downgraded to an inferred hint.
    const strong = rule.tier === 'explicit_request' || rule.tier === 'tender' || rule.tier === 'medium';
    const tier: SignalTier = strong && !src ? 'inferred' : rule.tier;
    out.push({
      tier, label: rule.label, evidence: snippet(text, m.index), sourceUrl: src,
      observed: !!src && strong, observedAt: observedAt ?? null, offers: rule.offers,
    });
  }
  return out;
}

export function freshnessFactor(observedAt: string | null | undefined, now = new Date()): number {
  if (!observedAt) return 0.5; // unknown date = unverified freshness
  const t = new Date(observedAt).getTime();
  if (Number.isNaN(t)) return 0.5;
  const days = (now.getTime() - t) / 86_400_000;
  if (days <= 30) return 1;
  if (days <= 90) return 0.5;
  return 0.25;
}

export interface ScoreResult {
  score: number;
  confidence: 'not_assessed' | 'low' | 'medium' | 'high';
  intent: 'explicit_request' | 'inferred_need' | 'none';
  offers: Offer[];
  breakdown: { label: string; tier: SignalTier; points: number; observed: boolean; sourceUrl: string | null; reason: string }[];
  guardrails: string[];
}

export function scoreSignals(signals: Signal[], now = new Date()): ScoreResult {
  const guardrails: string[] = ['Priority/fit score, not a probability of purchase.'];
  if (!signals.length) {
    return { score: 0, confidence: 'not_assessed', intent: 'none', offers: [], breakdown: [], guardrails: [...guardrails, 'No evidence recorded — not assessed.'] };
  }
  const bestPerTier = new Map<SignalTier, number>();
  const breakdown: ScoreResult['breakdown'] = [];
  for (const s of signals) {
    let f = freshnessFactor(s.observedAt, now);
    let reason = f === 1 ? 'fresh (≤30 days)' : f === 0.5 ? (s.observedAt ? 'aging (31–90 days)' : 'date unknown') : 'stale (>90 days)';
    if (s.tier === 'tender' && s.deadlineAt && new Date(s.deadlineAt).getTime() < now.getTime()) { f = 0; reason = 'deadline passed'; }
    if (!s.sourceUrl) reason += ', no source';
    const pts = Math.round(TIER_MAX[s.tier] * f);
    const counted = Math.max(0, pts - (bestPerTier.get(s.tier) ?? 0));
    bestPerTier.set(s.tier, Math.max(bestPerTier.get(s.tier) ?? 0, pts));
    breakdown.push({ label: s.label, tier: s.tier, points: counted, observed: s.observed, sourceUrl: s.sourceUrl, reason });
  }
  let score = [...bestPerTier.values()].reduce((a, b) => a + b, 0);
  const anyObserved = signals.some((s) => s.observed);
  const explicit = signals.some((s) => s.observed && (s.tier === 'explicit_request' || s.tier === 'tender') && (s.tier !== 'tender' || !s.deadlineAt || new Date(s.deadlineAt) >= now));
  if (!anyObserved) { score = Math.min(score, 35); guardrails.push('No observed signal with a source — capped at 35.'); }
  score = Math.max(0, Math.min(100, score));
  const confidence: ScoreResult['confidence'] = explicit ? 'high' : anyObserved ? 'medium' : 'low';
  if (explicit) guardrails.push('A public request is not a guaranteed sale; verify it is still active.');
  const offers = [...new Set(signals.flatMap((s) => s.offers))];
  return { score, confidence, intent: explicit ? 'explicit_request' : 'inferred_need', offers, breakdown, guardrails };
}

/** Prospect analysis from stored research/notes only. No data written. */
export function analyseProspect(p: { website?: string | null; notes?: string | null; research?: unknown; updated_at?: string | null }): { signals: Signal[]; result: ScoreResult } {
  const r = (p.research && typeof p.research === 'object' ? p.research : {}) as Record<string, unknown>;
  const researchText = [r.summary, ...(Array.isArray(r.hooks) ? r.hooks : []), ...(Array.isArray(r.signals) ? r.signals : [])]
    .filter((x): x is string => typeof x === 'string').join('\n');
  const src = safeHttpUrl(r.source_url) ?? (researchText ? safeHttpUrl(p.website) : null);
  const at = typeof r.researched_at === 'string' ? r.researched_at : null;
  const signals = [
    ...detectSignals(researchText, src, at),
    // Admin notes carry no public source: inferred only.
    ...detectSignals(p.notes ?? '', null, null),
  ];
  const dedup = signals.filter((s, i) => signals.findIndex((o) => o.label === s.label) === i);
  return { signals: dedup, result: scoreSignals(dedup) };
}

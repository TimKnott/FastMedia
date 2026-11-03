import { evaluateMarketingEligibility, normaliseEmail, type MarketingPermission } from '../../supabase/functions/_shared/legal-eligibility';

export const CONTACT_TYPES = ['unknown', 'generic_business_inbox', 'named_business_contact', 'sole_trader_personal', 'existing_customer', 'explicit_opt_in', 'enquiry_transactional_only'] as const;
export const EMAIL_ROUTES = ['none', 'consent', 'existing_customer'] as const;

export type PermissionForm = Record<string, string | boolean | null>;

const EVIDENCE_KEYS = ['email', 'country', 'contact_type', 'gdpr_lawful_basis', 'email_route', 'consent_at', 'consent_text', 'consent_source', 'consent_sender', 'consent_scope', 'consent_revoked_at', 'customer_sale_ref', 'customer_collected_at', 'customer_sender', 'customer_similar_products', 'customer_optout_offered_at_collection', 'objection_at', 'country_assessment_ref', 'notes'] as const;

/** Builds the row to save. Any evidence edit clears the review, so a human must re-review it. */
export function toPermissionRow(f: PermissionForm) {
  const row: Record<string, unknown> = {};
  for (const k of EVIDENCE_KEYS) {
    const v = f[k];
    row[k] = typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : v ?? null;
  }
  row.email = normaliseEmail(String(f.email ?? ''));
  row.country = row.country ? String(row.country).toUpperCase() : null;
  row.contact_type = row.contact_type ?? 'unknown';
  row.email_route = row.email_route ?? 'none';
  row.gdpr_lawful_basis = row.gdpr_lawful_basis ?? 'none_recorded';
  row.legal_review_at = null;
  return row;
}

/** Same shared fail-closed gate the server enforces; display only — it never grants permission. */
export function previewDecision(p: Partial<MarketingPermission> | null, suppressed: boolean, lookupFailed = false) {
  return evaluateMarketingEligibility(p as MarketingPermission | null, { suppressed, lookupFailed, footerHasOptOut: true });
}

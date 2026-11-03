/**
 * Server-side legal eligibility gate for PROMOTIONAL email. Pure and dependency-free
 * so the same logic is unit-tested in vitest and enforced in every Edge Function send path.
 * Fails closed: anything missing, unknown or uncertain blocks the send.
 * Publicly listed, scraped, purchased or enriched addresses never count as permission.
 */
export type ContactType =
  | 'generic_business_inbox' | 'named_business_contact' | 'sole_trader_personal'
  | 'existing_customer' | 'explicit_opt_in' | 'enquiry_transactional_only' | 'unknown';

export interface MarketingPermission {
  email: string;
  country: string | null;               // ISO-2
  contact_type: ContactType | null;
  gdpr_lawful_basis: string | null;     // recorded separately; never authorises email marketing alone
  email_route: 'none' | 'consent' | 'existing_customer' | null;
  consent_at?: string | null;
  consent_text?: string | null;
  consent_source?: string | null;
  consent_sender?: string | null;
  consent_scope?: string | null;
  consent_revoked_at?: string | null;
  consent_method?: string | null;        // how it was captured (form checkbox, signed paper...)
  consent_text_version?: string | null;  // version of the consent wording shown
  consent_proof_ref?: string | null;     // proof of the affirmative action (form log id, confirmation email id)
  customer_sale_ref?: string | null;
  customer_collected_at?: string | null;
  customer_sender?: string | null;
  customer_similar_products?: boolean | null;
  customer_optout_offered_at_collection?: boolean | null;
  objection_at?: string | null;
  legal_review_by?: string | null;
  legal_review_at?: string | null;
  country_assessment_ref?: string | null; // required for non-CZ countries
}

export const SENDER_ENTITY = 'FastMedia.Pro';
export interface GateResult { allowed: boolean; reasons: string[] }

const has = (v: unknown) => typeof v === 'string' ? v.trim().length > 0 : v !== null && v !== undefined;

export function evaluateMarketingEligibility(
  p: MarketingPermission | null,
  opts: { suppressed: boolean; lookupFailed?: boolean; footerHasOptOut: boolean },
): GateResult {
  const r: string[] = [];
  if (opts.lookupFailed) r.push('Eligibility or suppression check failed — blocked for safety.');
  if (opts.suppressed) r.push('Address is on the global suppression list (objection, unsubscribe, complaint, bounce or do-not-contact).');
  if (!p) {
    r.push('No documented marketing permission. Public, scraped, purchased or enriched contact details are not consent.');
    return { allowed: false, reasons: r };
  }
  if (p.objection_at) r.push('Recipient objected to marketing.');
  if (!p.contact_type || p.contact_type === 'unknown') r.push('Contact type is unknown.');
  if (p.contact_type === 'enquiry_transactional_only') r.push('Contact is enquiry/transactional-only; promotional email is not allowed.');
  if (!has(p.legal_review_by) || !has(p.legal_review_at)) r.push('No recorded human legal review.');
  if (!opts.footerHasOptOut) r.push('Message lacks sender identity and free opt-out.');
  const country = (p.country ?? '').toUpperCase();
  if (!country) r.push('Recipient country is unknown.');
  else if (country !== 'CZ' && !has(p.country_assessment_ref)) {
    r.push(`No country-specific legal assessment recorded for ${country}; Czech rules are not applied to other countries.`);
  }
  const route = p.email_route ?? 'none';
  if (route === 'consent') {
    if (p.consent_revoked_at) r.push('Consent was revoked.');
    for (const [k, label] of [['consent_at', 'consent time'], ['consent_text', 'consent wording'], ['consent_source', 'consent source'], ['consent_scope', 'consent purpose/scope'], ['consent_method', 'capture method'], ['consent_text_version', 'consent wording version'], ['consent_proof_ref', 'proof of affirmative action']] as const) {
      if (!has(p[k])) r.push(`Consent evidence missing: ${label}.`);
    }
    if ((p.consent_sender ?? '') !== SENDER_ENTITY) r.push('Consent was not given to this sender.');
  } else if (route === 'existing_customer') {
    if (!has(p.customer_sale_ref) || !has(p.customer_collected_at)) r.push('Customer exception: no evidence the address was collected during a sale.');
    if ((p.customer_sender ?? '') !== SENDER_ENTITY) r.push('Customer exception: address was not obtained by this sender.');
    if (p.customer_similar_products !== true) r.push('Customer exception: similar own products/services not confirmed.');
    if (p.customer_optout_offered_at_collection !== true) r.push('Customer exception: opt-out at collection not evidenced.');
  } else {
    r.push('No lawful email-marketing route (prior consent or own-customer exception) recorded. GDPR legitimate interest alone is not enough.');
  }
  return { allowed: r.length === 0, reasons: r };
}

export const normaliseEmail = (e: string) => String(e ?? '').trim().toLowerCase();

/** Path every unsubscribe link must use; the token is checked against email_unsubscribe_tokens. */
export const UNSUBSCRIBE_PATH = '/functions/v1/marketing-unsubscribe';
export const SENDER_ID_MARKERS = ['FastMedia.Pro', '17308551'];

/** Inspects the FINAL rendered message (after template + personalisation), never a flag. */
export function validateRenderedMarketingMessage(html: string, text: string): GateResult {
  const r: string[] = [];
  const h = String(html ?? ''), t = String(text ?? '');
  for (const m of SENDER_ID_MARKERS) {
    if (!h.includes(m) || !t.includes(m)) r.push(`Rendered message lacks sender identification (${m}).`);
  }
  const esc = UNSUBSCRIBE_PATH.replace(/[/.]/g, '\\$&');
  const hrefRe = new RegExp(`href=["']https://[^"'\\s]+${esc}\\?token=[A-Za-z0-9_-]{16,}["']`, 'i');
  const textRe = new RegExp(`https://\\S+${esc}\\?token=[A-Za-z0-9_-]{16,}`, 'i');
  if (!hrefRe.test(h)) r.push('Rendered HTML has no working unsubscribe link.');
  if (!textRe.test(t)) r.push('Rendered plain text has no unsubscribe link.');
  return { allowed: r.length === 0, reasons: r };
}

const envGet = (k: string): string | undefined =>
  // deno-lint-ignore no-explicit-any
  (globalThis as any).Deno?.env?.get?.(k);

/**
 * Final gate immediately before a promotional send: permission + suppression + the actual rendered
 * footer + a confirmed-live unsubscribe endpoint. Without `rendered` it is an approval preflight only.
 */
// deno-lint-ignore no-explicit-any
export async function checkMarketingEligibility(db: any, email: string, rendered?: { html: string; text: string }): Promise<GateResult> {
  const addr = normaliseEmail(email);
  const [perm, sup] = await Promise.all([
    db.from('marketing_permissions').select('*').eq('email', addr).maybeSingle(),
    db.from('suppressed_emails').select('id').ilike('email', addr).limit(1),
  ]);
  const footer = rendered ? validateRenderedMarketingMessage(rendered.html, rendered.text) : { allowed: true, reasons: [] };
  const base = evaluateMarketingEligibility(perm.data ?? null, {
    suppressed: (sup.data?.length ?? 0) > 0,
    lookupFailed: !!perm.error || !!sup.error,
    footerHasOptOut: footer.allowed,
  });
  const reasons = [...base.reasons, ...footer.reasons];
  if (rendered && envGet('MARKETING_UNSUBSCRIBE_LIVE') !== 'true') {
    reasons.push('Unsubscribe endpoint is not confirmed live (MARKETING_UNSUBSCRIBE_LIVE). Promotional sending is held.');
  }
  return { allowed: reasons.length === 0, reasons };
}

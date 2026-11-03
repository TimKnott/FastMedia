import { describe, it, expect } from "vitest";
import { evaluateMarketingEligibility, type MarketingPermission } from "../../supabase/functions/_shared/legal-eligibility";

const ok = { suppressed: false, footerHasOptOut: true };
const reviewed = { legal_review_by: "admin", legal_review_at: "2026-11-01" };
const consent: MarketingPermission = {
  email: "a@firma.cz", country: "CZ", contact_type: "explicit_opt_in", gdpr_lawful_basis: "consent",
  email_route: "consent", consent_at: "2026-10-01", consent_text: "I agree to FastMedia.Pro news",
  consent_source: "https://www.fastmedia.pro/newsletter", consent_sender: "FastMedia.Pro", consent_scope: "web services news", consent_method: "web form checkbox", consent_text_version: "v1", consent_proof_ref: "form-log-1", ...reviewed,
};

describe("promotional email legal gate", () => {
  it("blocks a public/scraped address with no permission record", () => {
    expect(evaluateMarketingEligibility(null, ok).allowed).toBe(false);
  });
  it("blocks a generic info@ inbox with only GDPR legitimate interest", () => {
    const r = evaluateMarketingEligibility({ email: "info@x.cz", country: "CZ", contact_type: "generic_business_inbox", gdpr_lawful_basis: "legitimate_interests", email_route: "none", ...reviewed }, ok);
    expect(r.allowed).toBe(false);
  });
  it("blocks a personal address without consent", () => {
    expect(evaluateMarketingEligibility({ ...consent, contact_type: "sole_trader_personal", email_route: "none" }, ok).allowed).toBe(false);
  });
  it("blocks unknown country and non-CZ without assessment", () => {
    expect(evaluateMarketingEligibility({ ...consent, country: null }, ok).allowed).toBe(false);
    expect(evaluateMarketingEligibility({ ...consent, country: "DE" }, ok).allowed).toBe(false);
  });
  it("blocks revoked consent", () => {
    expect(evaluateMarketingEligibility({ ...consent, consent_revoked_at: "2026-10-20" }, ok).allowed).toBe(false);
  });
  it("blocks an incomplete existing-customer exception", () => {
    const r = evaluateMarketingEligibility({ ...consent, contact_type: "existing_customer", email_route: "existing_customer", customer_sale_ref: "INV-1", customer_collected_at: "2026-01-01", customer_sender: "FastMedia.Pro", customer_similar_products: true, customer_optout_offered_at_collection: false }, ok);
    expect(r.allowed).toBe(false);
    expect(r.reasons.join()).toMatch(/opt-out at collection/);
  });
  it("blocks suppressed contacts and failed lookups even with valid consent", () => {
    expect(evaluateMarketingEligibility(consent, { ...ok, suppressed: true }).allowed).toBe(false);
    expect(evaluateMarketingEligibility(consent, { ...ok, lookupFailed: true }).allowed).toBe(false);
  });
  it("blocks transactional-only contacts and missing legal review", () => {
    expect(evaluateMarketingEligibility({ ...consent, contact_type: "enquiry_transactional_only" }, ok).allowed).toBe(false);
    expect(evaluateMarketingEligibility({ ...consent, legal_review_at: null }, ok).allowed).toBe(false);
  });
  it("allows documented, reviewed Czech consent to this sender", () => {
    expect(evaluateMarketingEligibility(consent, ok)).toEqual({ allowed: true, reasons: [] });
  });
});

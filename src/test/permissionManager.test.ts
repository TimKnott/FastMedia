import { describe, it, expect } from 'vitest';
import { toPermissionRow, previewDecision } from '@/lib/permissionManager';

describe('permission manager mapping', () => {
  it('normalises email/country and always clears the review on save', () => {
    const row = toPermissionRow({ email: '  A@B.CZ ', country: 'cz', consent_text: ' ', legal_review_at: '2026-01-01' });
    expect(row.email).toBe('a@b.cz');
    expect(row.country).toBe('CZ');
    expect(row.consent_text).toBeNull();
    expect(row.legal_review_at).toBeNull();
    expect(row.email_route).toBe('none');
  });
  it('blocks a record with no route even if a GDPR basis exists', () => {
    const d = previewDecision({ email: 'a@b.cz', country: 'CZ', contact_type: 'named_business_contact', gdpr_lawful_basis: 'legitimate_interest', email_route: 'none', legal_review_by: 'u', legal_review_at: 'x' }, false);
    expect(d.allowed).toBe(false);
  });
  it('blocks when suppressed even with full consent', () => {
    const p = { email: 'a@b.cz', country: 'CZ', contact_type: 'explicit_opt_in' as const, gdpr_lawful_basis: 'consent', email_route: 'consent' as const, consent_at: 't', consent_text: 'x', consent_source: 's', consent_scope: 'news', consent_sender: 'FastMedia.Pro', consent_method: 'form', consent_text_version: 'v1', consent_proof_ref: 'p', legal_review_by: 'u', legal_review_at: 't' };
    expect(previewDecision(p, false).allowed).toBe(true);
    expect(previewDecision(p, true).allowed).toBe(false);
    expect(previewDecision(null, false).allowed).toBe(false);
  });
});

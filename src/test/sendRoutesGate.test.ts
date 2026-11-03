import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateRenderedMarketingMessage, evaluateMarketingEligibility } from '../../supabase/functions/_shared/legal-eligibility';

const fn = (p: string) => readFileSync(`supabase/functions/${p}`, 'utf8');
const TOKEN = 'a'.repeat(32);
const URL = `https://x.supabase.co/functions/v1/marketing-unsubscribe?token=${TOKEN}`;
const ID = 'FastMedia.Pro · Timothy Knott, IČO 17308551';

describe('rendered footer validation (actual message, not a flag)', () => {
  it('passes only with identity + unsubscribe link in both HTML and text', () => {
    expect(validateRenderedMarketingMessage(`<p>Hi</p><p>${ID} <a href="${URL}">Unsubscribe</a></p>`, `Hi\n${ID} Unsubscribe: ${URL}`).allowed).toBe(true);
  });
  it('rejects reply-STOP-only footers', () => {
    const r = validateRenderedMarketingMessage(`<p>${ID}. Reply STOP</p>`, `${ID}. Reply STOP`);
    expect(r.allowed).toBe(false);
    expect(r.reasons.join(' ')).toMatch(/unsubscribe link/);
  });
  it('rejects missing sender identity', () => {
    expect(validateRenderedMarketingMessage(`<a href="${URL}">u</a>`, URL).allowed).toBe(false);
  });
  it('rejects a link without a real token or to another host path', () => {
    expect(validateRenderedMarketingMessage(`${ID}<a href="https://x/functions/v1/marketing-unsubscribe?token=">u</a>`, `${ID} ${URL}`).allowed).toBe(false);
    expect(validateRenderedMarketingMessage(`${ID}<a href="https://evil/unsubscribe">u</a>`, `${ID} ${URL}`).allowed).toBe(false);
  });
});

describe('consent evidence completeness', () => {
  const base = { email: 'a@b.cz', country: 'CZ', contact_type: 'explicit_opt_in' as const, gdpr_lawful_basis: 'consent', email_route: 'consent' as const, consent_at: 't', consent_text: 'x', consent_source: 's', consent_scope: 'news', consent_sender: 'FastMedia.Pro', consent_method: 'form', consent_text_version: 'v1', consent_proof_ref: 'log1', legal_review_by: 'u', legal_review_at: 't' };
  const ok = { suppressed: false, footerHasOptOut: true };
  it('valid complete consent passes', () => expect(evaluateMarketingEligibility(base, ok).allowed).toBe(true));
  it.each(['consent_method', 'consent_text_version', 'consent_proof_ref'])('missing %s blocks', (k) => {
    expect(evaluateMarketingEligibility({ ...base, [k]: null }, ok).allowed).toBe(false);
  });
  it('a review stamp alone cannot manufacture consent', () => {
    expect(evaluateMarketingEligibility({ email: 'a@b.cz', country: 'CZ', contact_type: 'named_business_contact', gdpr_lawful_basis: 'legitimate_interest', email_route: 'consent', legal_review_by: 'u', legal_review_at: 't' }, ok).allowed).toBe(false);
  });
  it('failing rendered footer blocks even full consent', () => {
    expect(evaluateMarketingEligibility(base, { suppressed: false, footerHasOptOut: false }).allowed).toBe(false);
  });
});

describe('every promotional send route checks the final rendered message before dispatch', () => {
  it('outreach-agent queue/approve/follow-up/retry path (sendMessage) and visitor recovery', () => {
    const s = fn('outreach-agent/index.ts');
    expect(s).toMatch(/import \{ checkMarketingEligibility \} from '\.\.\/_shared\/legal-eligibility\.ts'/);
    const calls = s.match(/checkMarketingEligibility\(db, [^)]*\{ html:/g) ?? [];
    expect(calls.length).toBe(2);
    // Every real provider dispatch in the file is preceded by a rendered gate in the same function.
    const gated = s.indexOf("checkMarketingEligibility(db, prospect.email, { html: finalHtml");
    expect(gated).toBeGreaterThan(0);
    expect(gated).toBeLessThan(s.indexOf('const result = await sendViaGmail(recipient, subject, finalHtml'));
    expect(s.indexOf("checkMarketingEligibility(db, signal.email, { html: recHtml")).toBeLessThan(s.indexOf('sendViaGmail(recipient, finalSubject, recHtml'));
  });
  it('flowlu-admin manual reply and sequences share the gated sendLeadEmail', () => {
    const s = fn('flowlu-admin/index.ts');
    const body = s.slice(s.indexOf('async function sendLeadEmail'), s.indexOf('async function sendLeadEmail') + 2000);
    expect(body.indexOf('checkMarketingEligibility(sb, to, { html')).toBeGreaterThan(0);
    expect(body.indexOf('checkMarketingEligibility(sb, to, { html')).toBeLessThan(body.indexOf('sendViaGmail('));
    // Only other dispatch is the owner-inbox test copy.
    expect((s.match(/sendViaGmail\(/g) ?? []).length).toBe(2); // test step + sendLeadEmail
    expect(s).toMatch(/const to = 'timknott@fastmedia\.pro';\s*\n\s*const html[^\n]*\n\s*const r = await sendViaGmail\(to/);
  });
  it('manual Gmail is reply-only and Vbout list sends are held', () => {
    expect(fn('gmail-send/index.ts')).toMatch(/Replies must reference a received message/);
    expect(fn('vbout-proxy/index.ts')).not.toMatch(/sendcampaign\.json/);
  });
  it('the final gate holds sends until the unsubscribe endpoint is confirmed live', () => {
    expect(fn('_shared/legal-eligibility.ts')).toMatch(/MARKETING_UNSUBSCRIBE_LIVE'\) !== 'true'/);
  });
});

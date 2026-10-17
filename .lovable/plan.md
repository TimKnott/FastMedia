# FastMedia Widget Shop — phased scope and cost review

## Approval boundary
Planning only. No application changes, migrations, payment setup, secrets, paid AI tests, deployment or publishing. Approving this document approves the proposed scope for review, not implementation or spending. Each phase needs separate explicit build approval after its unresolved commercial decisions are settled.

## Recommended approach
Create one shop inside FastMedia rather than another project. Public visitors can browse thumbnail product cards; tools remain private until a customer has the appropriate paid entitlement. Reuse existing accounts, business profiles, questionnaires, reporting and payment components where suitable, but do not assume current admin-only tools are safe for customer access.

Offer categories: PPC management packages, SEO audits, social advertising tools and AI Ad Studio subscriptions. Distinguish one-off services from recurring subscriptions. Recurring products are billed annually as one upfront payment, with monthly usage allowances; advertising spend is always separate from FastMedia fees. No invented product prices, performance guarantees or automatic-publishing claims.

## Phase 1 — catalogue and verified enquiry (first approval gate)
**Deliver:** thumbnail cards with product scope, exclusions, annual fee, monthly allowance where relevant and a clear enquiry action; an interactive website audit/design brief; email verification; a private admin lead report showing verified requests and their answers.

The website design tool in this phase is a guided brief/module selection, not a new visual site builder or an automatically generated website. Audits collect information for review, not unverified AI scores or paid crawling. Customer copy is British English.

Reuse normal verified-email accounts where suitable. Preserve abandoned draft answers without making unverified submissions qualified leads. Rate-limit submissions and resend requests; prevent email/account enumeration. Ask only necessary business information and show its purpose and privacy notice. Newsletter consent is separate and optional.

**Exclude:** checkout, customer tool access, AI generation, automatic website creation, automated audits, Browse AI runs and advertising integrations.

**Cost shape:** smallest useful release; frontend/intake/admin work plus verification and security checks. Runtime costs can include backend requests, storage and verification email delivery. No AI model calls are required by this phase.

**Gate:** approve product contents, fees and intake questions; approve Phase 1 build separately. If prices are not agreed, keep the catalogue in private review rather than publish misleading or placeholder prices.

## Phase 2 — annual payments and entitlement foundations
**Deliver:** checkout using an existing suitable payment integration; verified customer accounts; annual upfront subscription lifecycle; receipts/provider references; server-side product entitlements; cancellation/non-renewal behaviour; admin subscription overview.

Payment events must be validated and processed idempotently. Never grant access from a browser success URL alone. Isolate customers and their businesses; test payment success, failure, renewal, refund and duplicate/out-of-order notifications. Catalogue prices and charged amounts must come from the same authoritative product records.

**Exclude:** paid AI generation until Phase 3 usage safeguards are complete. Payment-provider onboarding and live activation require separate approval. Do not replace an existing payment integration without agreement.

**Cost shape:** more involved than Phase 1 because money and access controls require end-to-end testing. Provider transaction/subscription fees are additional; select and verify the existing integration and applicable rates before quoting them. Confirm seller/tax handling for the actual service mix; current non-VAT-registration must not be treated as a blanket cross-border exemption.

**Gate:** agree annual renewal, cancellation, refund and consumer terms. Existing small-website guarantees do not automatically apply to these products.

## Phase 3 — bounded customer AI Ad Studio
**Deliver:** a customer-safe subset of Ad Studio, isolated brand facts and saved adverts; approval before spending allowance; visible remaining monthly units; server-enforced usage limits; compliance checks and export/copy controls.

Define a billable customer unit explicitly, such as one successful text-ad generation, independently of Lovable workspace credits. Set bounds for output count, input size and model work. Reserve allowance atomically before generation, settle successful work and release failed work under a defined retry policy. Prevent double-clicks/concurrent requests from exceeding the allowance. Monthly resets follow the agreed subscription anniversary; proposed default is no rollover, no automatic overage purchase and no unlimited use.

Start with text adverts only. Image/video generation, automatic social posting, lead harvesting and a full creative editor are excluded. Display proposed allowances as undecided until cost/quality testing supports them; do not sell a numerical allowance without measuring a representative request.

**Cost shape:** significant security/usage work despite reusing admin tools. Generation consumes Lovable AI usage and backend resources; unlimited customer demand must not become unlimited owner spending.

**Gate:** approve included units, reset rules, failure accounting, model/output limits and representative paid tests before implementation.

## Phase 4 — customer advertising reports
**Deliver first:** account-isolated reports of ad spend, clicks and enquiries from dated admin-entered or approved CSV data. Label the source, reporting period, currency and attribution method. Show FastMedia fees separately from ad spend. Missing figures remain unknown, not zero; do not imply a click caused an enquiry without evidence. Include cost-per-click/enquiry only when the underlying denominators are valid.

**Optional later:** Google/Meta/Sklik automatic imports after checking each provider's access, account permissions and terms. Each is a separately approved integration; no automatic synchronisation promised in the initial report phase.

**Cost shape:** manual/CSV reporting is the cheaper starting point. Automated imports add authentication, scheduled work, reconciliation, provider limits and maintenance.

## Credit estimate — what can be stated realistically
An accurate numerical build-credit quote is unavailable: build pricing is usage-based and depends on complexity, reuse, testing and iterations. Earlier estimates such as “5–8 build sessions” or “1–3 credits” were not validated and should not guide this purchase decision. No supported total, credit ceiling guarantee or numeric per-phase estimate can be given now.

| Phase | Relative build scope | Ongoing cost sources |
| --- | --- | --- |
| 1: catalogue/intake | Lowest of these phases | Backend, stored enquiries, verification emails |
| 2: payments/access | Higher; security and payment lifecycle tests | Backend and payment-provider fees |
| 3: bounded AI adverts | Higher; customer isolation and atomic allowance accounting | AI requests, backend and saved outputs |
| 4: manual reports | Lower than automated integrations | Backend and approved uploads |
| Later automatic reports | Separate substantial integration scope | Provider access, scheduled requests and maintenance |

Plan mode consumes 1 credit per message; build mode is usage-based. Cloud and AI use the unified credit balance, with documented monthly allowances of 20 Cloud credits and 4 AI credits; these are general allowances, not this workspace's measured remaining coverage. External payment/email/crawler services may charge separately.

**Spend-control recommendation:** approve only Phase 1 first. Agree a user-chosen build spending limit and set an appropriate blocking limit in Workspace settings → Usage limits & alerts where available before starting. A limit may halt work midway; it is not a fixed-price completion guarantee. Review actual credits used and the working result before approving Phase 2. No runtime usage or cash savings have been measured in this planning review.

## Technical details for later implementation
- Reuse the current Lovable Cloud backend, auth, Edge Functions, customer portal and business-profile records; inspect existing checkout before choosing anything new.
- Existing admin authorisation is not customer authorisation. Customer operations require paid entitlement and owner/business scoping on every read/write and generation request, with restrictive RLS and explicit grants for any approved new application tables.
- Keep payment credentials and model/service credentials server-side. Never expose other customers' leads, prompts, campaign data or subscription metadata.
- Keep billing periods, monthly usage ledger and customer reports durable and idempotent. Do not use frontend counters as enforcement.
- Add concrete tests for agreed prices, annual charge amount, monthly limits, reset/failure rules, entitlements and cross-customer isolation. Verify each phase through real authenticated UI flows and test payments before live approval.
- Build no Browse AI/MCP features as part of this shop. Those remain separate approved-scope decisions.

## Decisions needed before a build
1. Final product list, exact deliverables, annual upfront prices and whether each audit is one-off or subscription-based.
2. Monthly AI units and unit definition; reset/rollover/failure rules. Allowances should be finalised after approved cost testing, not guessed.
3. Refund, renewal and cancellation terms for marketing services/subscriptions, plus appropriate legal review.
4. Guided website brief scope: confirm that a visual editor/automatic site generator is not required for Phase 1.
5. First reporting source (recommended: admin-entered/CSV), included platforms and how enquiries will be attributed.
6. Owner's chosen Phase 1 spend limit and explicit implementation approval.

Nothing is implemented or published by this plan.
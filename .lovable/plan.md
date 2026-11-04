# Opportunity Intelligence MVP + Prospecting buying signals (cap: 20 Build credits)

Scope is limited to what fits under the cap. I'll stop and report if spend gets close. No publishing, outreach, external AI calls, new packages or changes to prospect data.

## What gets built (in priority order)

1. **Opportunities area** (admin only) at `/admin/opportunities`, with its own sidebar item, kept separate from prospects, leads and CRM.
   - Inbox: search, plus filters for type, status, country, service need, score band and follow-up due.
   - Detail page `/admin/opportunities/:id`: type badge ("Active buyer request" or "Prospect hypothesis"), sources (URL, source type, method, retrieved date, freshness), country, service need, why it fits FastMedia, suggested deliverables, evidence, risks, status, follow-up date, notes, score breakdown with guardrail text, change history, and an "Ask ChatGPT" link built only from stored facts.
2. **Import** at `/admin/opportunities/import`: upload JSON or CSV, preview each row with accept/reject reasons, then commit. Rows are rejected if they have no source URL, a bad URL, an unknown type, or a private-looking contact (free-mail or personal address) that isn't marked as a published business contact. Rows whose source is a company website or directory listing are forced to "Prospect hypothesis". Re-importing the same file, or the same source URL, creates no duplicates. The page states that no automated discovery writes here.
3. **Buying signals on the Prospecting desk**: each card gets an evidence panel showing observed signals and their source, inferred needs labelled "Hypothesis", recommended FastMedia offers, confidence with reasons, and a 0–100 priority score labelled "priority/fit, not purchase probability". Prospects with no usable evidence show "Not assessed · low confidence". No existing records are changed. The ChatGPT prompt gains the signal summary. Existing link features stay as they are.
4. **Outcomes + method view** (if budget allows): manual outcome log per opportunity (proposal sent, reply, won, lost, value in cents), and a source/method table where missing values show "not recorded".
5. **Digest page** (if budget allows): `/admin/opportunities/digest` shows up to 5 top picks, 8 short items and due follow-ups. No email is sent.

## Scoring rules (one shared, deterministic module)

| Signal | Tier | Observed/inferred | Max contribution |
|---|---|---|---|
| Explicit request ("looking for a new website", "redesign quote", "need online booking", "ecommerce shop", "CRM integration", "more enquiries/leads") | Highest | Observed | 40 |
| Tender/RFP with relevant scope and a deadline still ahead | High | Observed | 35 |
| Hiring for web/digital/ecommerce/marketing/CRM, new branch/expansion, new product line, active online sales, stated booking/enquiry pain | Medium | Observed, only with a source | 20 |
| Outdated/non-mobile site, broken forms, no booking, weak SEO, catalogue without a shop | Low–medium | Inferred | 10 |
| Industry match only, no website, generic social page only | Very low | Inferred | 3 |

- Points only count when there's evidence text plus a source. A request without a source becomes an inferred signal.
- Freshness decay: full weight within 30 days, half up to 90 days, quarter after that. Tenders past their deadline count as 0.
- Without observed signals the score is capped at 35. Without any evidence it's capped at 10 and confidence is "low".
- The words "request" and "intent" only appear for explicit observed requests. The UI never says a sale is likely or definite.
- Signals map to offers: website/redesign, ecommerce, booking/calendar, enquiry automation/CRM, SEO/AI visibility, directory/search tool, integrations.

## Technical details

- One migration, all admin-only (`has_role(auth.uid(),'admin')`), with grants to `authenticated` and `service_role` only (no `anon`):
  - `opportunities`: type check (`active_buyer_request` | `prospect_hypothesis`), source_url NOT NULL, `source_url_norm` UNIQUE, plus source_type, discovery_method, country, service_need, fit_reason, deliverables/evidence/risks/score_breakdown as jsonb, priority_score, status, follow_up_at, notes, batch_id.
  - `opportunity_import_batches` with a unique file_hash.
  - `opportunity_outcomes`: manual entries, no delete.
  - `opportunity_events`: append-only, filled by a trigger on insert/update.
- Import goes through a security-definer RPC `opportunity_import(_filename, _hash, _rows)`. It calls `repository_assert_admin()`, re-validates on the server, and uses `ON CONFLICT DO NOTHING`. It writes nothing to prospects, outreach or CRM tables.
- New files: `src/lib/buyingSignals.ts` (rules, scoring, offer mapping), `src/lib/opportunityImport.ts` (parse, validate, normalise, dedupe), and pages under `src/pages/admin/opportunities/`. Edits to `App.tsx` routes, `AdminSidebar.tsx`, and `AdminProspecting.tsx` (signal panel).
- Prospect signals are read from existing `prospects.research`/`notes`/`trade` in the browser, so no schema or data change is needed.
- Tests (vitest): scoring tiers, caps, freshness and expired tenders; that no evidence means no high score; that a signal without a source is downgraded; import rejection rules, website-to-hypothesis labelling, and in-file/URL dedupe; route registration; plus a rollback-only DB check that non-admins are refused.
- Checks: typecheck, the tests, and the harness build log. I can't see the commit SHA or exact credit usage, so the report will say so.

## Out of scope

Live or scheduled discovery, ingest endpoints, cross-post grouping, pricing benchmarks and the quote builder, digest email, and any publishing.

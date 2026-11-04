# Global Opportunity Intelligence workspace — plan (planning only)

No code was changed, nothing was built, installed, migrated or deployed, and no Build credits were spent on implementation. Inspection was read-only. (The earlier Email Design Studio plan was not approved; it can be regenerated on request.)

## 1. What exists today (verified by read-only inspection)

| Need | Existing piece | Decision |
|---|---|---|
| Admin shell, sidebar, role gating | `src/components/admin/AdminSidebar.tsx` (items with `minRole: 'admin'`), admin routes nested under `/admin` in `src/App.tsx` | Add one sidebar group and nested routes |
| Server-side admin check | `supabase/functions/_shared/require-admin.ts` (session admin check + `x-job-token` against `internal_job_tokens`) | Reuse for every new function |
| DB admin check | `has_role()` hierarchy, `repository_assert_admin()` | Reuse in RLS and RPCs |
| Public-source finder | `/admin/finder` + `finder` function, `directory_finds`, `lead_feedback` (bad-result reporting) | Reuse UI patterns and feedback idea; do not reuse tables |
| Leads hub / prospecting | `/admin/leads-hub`, `/admin/prospecting`, `prospects`, `outreach_*` | Keep separate; optional manual "copy to prospect" later, gated |
| Lead Repository | `lead_repository_*` tables, append-only events | Copy the audit/event pattern, not the tables |
| Import | `sheets-import` function, CSV parsing in `src/lib/emailStudio.ts` | Reuse parsing for JSON/CSV import |
| Email | `send-app-email` queue, `notify.fastmedia.pro`, `_shared/alert-recipients.ts` | Digest uses the existing internal alert route only |
| Audit | `audit_logs` + `audit_log_changes()` trigger | Attach trigger to new tables |

Not reused (different meanings): `leads`, `lead_emails`, `scraped_leads`, `prospects`, `lead_repository_*`.

There is currently no endpoint that accepts research results from an outside automation, and no `/admin/opportunities` route. Nothing should claim an external scheduled task can write into the app until phase 3 is built.

## 2. Product shape

New admin area "Opportunities" at `/admin/opportunities`:
- **Inbox** — search, filter (channel, country, kind, status, score, tags, follow-up due, duplicate group), sort, bulk tag/status.
- **Detail** `/admin/opportunities/:id` — brief, all sources, cross-post group, company and public contact route, pricing and local benchmarks, quote builder (opening price, milestones, duration, retainer), risks, score breakdown, notes, follow-up, outcome log, history.
- **Groups** `/admin/opportunities/groups/:id` — probable duplicates with evidence and confidence.
- **Digest** `/admin/opportunities/digest/:date` — the same content as the daily email, with view-all links.
- **Methods** `/admin/opportunities/methods` — channel/method performance.
- **Import** `/admin/opportunities/import` — upload JSON/CSV batch, preview, validate, commit.

Two record kinds, always labelled: **Active buyer request** (a public brief exists) and **Prospect hypothesis** (signal-based guess, e.g. hiring or catalogue size). Hypotheses can never show a "stated budget".

## 3. Data model (new tables, all admin-only)

- `opportunities` — kind, title, brief_summary, brief_excerpt (short quote, not full copies of paywalled text), channel, discovery_method, country, currency, posted_at, deadline_at, discovered_at, company, public_contact_route (URL or published business channel only), stated_budget_min/max_cents, suggested_quote_cents, opening_price_cents, retainer_monthly_cents, estimated_weeks, deliverables jsonb, milestones jsonb, risks jsonb, tags text[], priority_score, score_breakdown jsonb, status (new, reviewing, qualified, proposal_sent, won, lost, archived, rejected), follow_up_at, group_id, match_confidence, batch_id, created_by.
- `opportunity_sources` — opportunity_id, url, source_name, channel, access_basis (official API, search-indexed public page, user export, public register), retrieved_at, excerpt.
- `opportunity_benchmarks` — opportunity_id or country+service, rate_low/high_cents, currency, source_url, retrieved_at, note.
- `opportunity_groups` — label, confidence, evidence jsonb (shared phrases, stack, features, budget, dates).
- `opportunity_notes`, `opportunity_outcomes` (proposal sent/response/win/loss/value — manual only, with actor and date).
- `opportunity_import_batches` — source label, file hash, row count, accepted/rejected counts, errors, nonce, created_by, committed_at.
- `opportunity_events` — append-only audit (create, update, status, import, group change, export).
- `opportunity_digests` — date, selected ids, rendered summary, sent_at (internal only).

Money in cents with currency code. Rules:
- RLS: `has_role(auth.uid(),'admin')` for select/insert/update; no delete for events/outcomes; grants to `authenticated` and `service_role` only, never `anon`.
- Writes from functions go through validated security-definer RPCs, like the Lead Repository.
- Store no personal emails or phone numbers unless explicitly published as a business contact; never guessed addresses.

## 4. Discovery channels and compliance stance

Every source gets a channel profile with an allowed access method, checked before it is used:

| Channel | Safe method to verify | Not allowed |
|---|---|---|
| Upwork | Approved official API only; otherwise manual review of search-indexed public pages | Bots, logged-in scraping |
| Fiverr | Verify whether public buyer requests exist and terms permit; likely manual only | Assuming buyer-side access |
| Freelancer, PeoplePerHour, Guru, Contra, Malt, Workana, Codeable | Check each for official API/RSS and terms; else manual or search-indexed | Login-only areas, automated bidding |
| Reddit, Hacker News, Stack Exchange | Official APIs (HN Firebase API, Stack Exchange API, Reddit API terms) | Private groups |
| Trade forums/communities | Public pages per robots/terms | Members-only areas |
| Company signals (hiring, expansion, new product, warehouse) | Public company pages, press releases, public job boards per terms | Inferring private data |
| ERP/PIM partner ecosystems | Public partner directories | Bulk extraction where terms forbid |
| Procurement | Official open-data portals (e.g. TED, national registers) | — |

Checklist before each channel goes live: current terms URL and date, robots rules, API availability and approval status, rate limits, attribution requirements, permitted storage of excerpts. Channels without a confirmed basis stay "manual entry only". No CAPTCHA handling, no paid scraping services.

## 5. Cross-post matching

Run at import and on demand, server-side, no AI credits required for the first pass:
1. Normalise text, extract distinctive phrases (rare n-grams, 5–8 words), named stack terms, feature list items, budget figures and dates.
2. Score pairs: exact distinctive phrase overlap (high weight), unusual requirement overlap, stack overlap, feature overlap, budget closeness, posting-date proximity.
3. Confidence bands: probable (≥0.8), possible (0.5–0.8), below that ignored.
4. Group view shows each matching phrase side by side with source links. Wording: "probable cross-post", never "same buyer" unless a public page states it.
5. Admin can confirm, split or reject a group (logged).

## 6. Pricing and scoring

- Local benchmarks are stored with source URL and date; if none exist the quote shows "no benchmark — manual".
- Suggested quote = admin-configurable rate card per service type × estimated effort, compared with the stated budget and benchmarks; displayed as a band with reasons, never as fact.
- Priority score (0–100) from configurable weights: service fit (API/catalogue/B2B/ERP-PIM highest), budget vs quote, freshness, contactability, country, competition signals, duplicate status. Breakdown always visible.

## 7. Method performance

Per channel and method, by week/month: discovered, qualified, high-priority, duplicate rate, contactable rate, proposals, responses, wins, estimated value band. Proposal/response/win come only from manually recorded outcomes; empty cells show "not recorded", never estimated conversions.

## 8. Daily digest email

- Internal only, to the confirmed alert recipients, via the existing queue.
- Layout: header with date and counts; "Top picks" (3–5 cards: title, country flag + currency, value band, one-line teaser, why interesting, priority badge, button "Open in admin"); "Also new" compact list (max 8 one-liners); "Follow-ups due"; footer "View all in admin".
- Links: `https://www.fastmedia.pro/admin/opportunities/:id` — admin sign-in is required; links carry no tokens. Deep links work only once the routes in section 2 exist (phase 1).
- Sending the digest is the only email; it never contacts buyers.

## 9. Handoff from research automation (safest minimal choice)

Options compared:
1. **Admin JSON/CSV import (recommended first).** External research (ChatGPT or another tool) produces a file in a fixed schema; admin uploads it; server validates, previews, dedupes, commits. No secret exposed, no unattended writes.
2. **Signed one-time batch import (phase 3 option).** Automation uploads a batch signed with a server secret; it lands as "pending" and an admin must approve it before records appear.
3. Authenticated ingest endpoint with scoped secret — most automation, highest risk; only after 1–2 prove the schema.

Choice: option 1 now; option 2 later if wanted. Imports are idempotent via file hash and per-source URL dedupe.

## 10. Phases and estimated Build credits

Estimates are rough and assume no Max mode; actual usage must be checked in workspace usage. Nothing starts without explicit approval.

| Phase | Scope | Estimate |
|---|---|---|
| 0 | This plan, import schema spec, channel terms checklist, rate card values | 0 (zero-credit: can be done in ChatGPT/docs) |
| 1 | Tables, RLS, RPCs, inbox, detail page, notes, status, follow-up, sidebar entry | 4–6 |
| 2 | JSON/CSV import with preview and validation; cross-post grouping and group view | 3–5 |
| 3 | Pricing benchmarks, quote builder, scoring weights settings | 2–4 |
| 4 | Digest page + internal daily digest email (scheduled) | 2–3 |
| 5 | Method-performance dashboard and outcome logging | 2–3 |
| 6 (optional) | Signed batch import with admin approval; per-channel official API connectors where approved | 3–6 per connector |

Zero-credit work you can do externally: the import file schema and sample files, channel terms research, rate card numbers, digest copy, scoring weight choices, writing research prompts for ChatGPT that output the import format.

## 11. Acceptance criteria

- Non-admins and signed-out users get no rows or pages (RLS + server check tests).
- Opportunity tables are distinct from prospects/leads; no code path writes to outreach or CRM.
- Every record shows kind (buyer request vs hypothesis), at least one source URL, and discovery method.
- Import rejects rows without a source URL, with invalid currency, or with guessed/private contact data; re-importing the same file creates no duplicates.
- Duplicate groups show evidence and confidence; wording never claims same buyer.
- Conversion figures only from recorded outcomes.
- Digest has at most 5 highlights + 8 compact items, every item links to its admin detail page, and is sent only to the alert recipients.
- No outreach, no automatic sending, no production actions.

## 12. Risks

- Marketplace terms change; channels must be re-verified periodically.
- Pricing suggestions may mislead if benchmarks are stale — always show source date.
- Daily scheduled digest adds small backend run costs.
- roadmap.md could not be updated in planning mode; it will be updated when building is approved.

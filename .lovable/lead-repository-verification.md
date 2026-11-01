# Lead Repository implementation and verification

## Delivered
Preview route: `/admin/lead-repository` in the existing app. Admin/super-admin navigation and route guard; database authorization remains mandatory.

Searchable, server-paginated contacts; owner/founder, company, industry, location, email validation and compliance filters. Complete source rows and attached email provenance in a detail panel. Private JSON export, CSV import with reported errors, legal-review form/history, manual objections/unsubscribe processing and dry-run campaigns with per-recipient reasons. Czech/English/German copy.

## Files
- `src/pages/admin/AdminLeadRepository.tsx`
- `src/lib/leadRepository.ts`, `src/lib/leadRepositoryCopy.ts`
- `src/App.tsx`, `src/components/admin/AdminSidebar.tsx`, `src/contexts/LanguageContext.tsx`
- `src/test/leadRepository.test.ts`
- `supabase/functions/_shared/suppression-gate.ts`
- `supabase/functions/flowlu-admin/index.ts`, `supabase/functions/outreach-agent/index.ts` — suppression checks saved, **not deployed**.
- `package.json`, `bun.lock` — Papa Parse CSV dependency and types.
- `AGENTS.md`, `roadmap.md`, author-owned verification notes; automatically refreshed database types.

## Database changes
Applied additive migrations `0011`–`0016` in `drizzle/migrations/`:
- Protected repository model and admin mutation functions.
- Server-side filtering/pagination and review history.
- Rollback-only safeguard diagnostic.
- Existing global suppression reason compatibility (`complaint` for objections, `unsubscribe` for unsubscribe; evidence kept separately).
- Explicit removal of inherited anonymous/direct-write grants.
- Role-boundary diagnostic using existing accounts, with attempted synthetic writes rolled back.

Tables: `lead_repository_leads`, `lead_repository_emails`, `lead_repository_campaigns`, `lead_repository_recipients`, `lead_repository_events`, `lead_repository_objections`, `lead_repository_reviews`.

Every table: RLS enabled; authenticated admin-minimum read policy plus restrictive admin boundary; no anonymous privileges; no authenticated direct insert/update/delete. Writes use validated admin-only functions. Service role retains table privileges. Objection evidence has no lead foreign key, so lead removal does not remove it. Existing `suppressed_emails` is the shared operational suppression list, not a parallel opt-out list.

`HOLD`, `DRY_RUN` and null send timestamps are database constraints; no repository sender or schedule exists. Consent/public email verification cannot override them.

## Import counts
Actual supplied dataset import: **0 leads, 0 email rows**. Files named leads, emails and compliance_review are absent from both upload mounts. Skipped/error counts for those absent files are **not applicable**, not a completed empty import. Actual CSV headers and source export dates need inspection when reattached. All columns of an imported row remain in private provenance JSON; searchable-field mapping may need adjustment to the actual normalized headers.

## Verification
- 30 targeted tests passed (14 repository/suppression, 7 Email Studio, 9 pacing/sanitizer).
- Automatic build: OK.
- Signed-out browser redirects to admin login; signed-in super-admin page, import controls and CS/EN/DE render correctly. Desktop 1280×1800 and mobile 390×844 checked; no horizontal page overflow or runtime errors.
- Database rollback-only diagnostic: stable lead/email deduplication, Czech UTF-8/all-field preservation, valid-email HOLD defaults, Czech permission gate, activation/send-timestamp rejection, global suppression and suppression survival after lead deletion all passed. No diagnostic rows persisted.
- Anonymous list/import/objection/dry-run requests denied; admin direct table writes denied.
- Existing editor account denied and super-admin allowed in database role diagnostic. No isolated user/moderator/admin account available for those live-session checks; their policy hierarchy was inspected, not claimed as browser-tested.
- Actual dataset import and populated-detail/campaign browser flow cannot be verified until the supplied files are available; no substitute lead data was inserted.

## Manual review / production boundary
Legal reviewer must document lawful processing, national electronic-marketing permission, consent/customer-exception evidence, privacy notice, effective opt-out route and retention duration. Recording review is not a legal guarantee or permission to send. Existing-customer exception scope must be specifically documented.

Saved Flowlu/outreach suppression fixes still require a separately authorised function deployment before they protect the production senders. Repository sending remains disabled. No emails, Gmail connections, new jobs, public endpoints, site publishing or function deployment performed.
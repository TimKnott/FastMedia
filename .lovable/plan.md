# Lead Repository — existing FastMedia Pro app

## Scope and assumptions
Add an admin-only CRM/review area at `/admin/lead-repository`. Keep existing enquiry, prospecting and campaign tools intact. This repository never feeds their sending queues. No Gmail connection, send job, email send, site publish or deployment is part of this work.

**Dataset blocker:** the upload mounts contain no leads, emails or compliance_review LeadRocks CSVs. Reattach the three files before their import can be completed. No fabricated or substitute lead data will be imported. Final field mapping and import counts depend on inspecting their actual headers.

## Ordered implementation
1. **Protected storage and access.** Use the existing hierarchical admin/super-admin role check, protected route and admin navigation. Enforce authorization in database policies and mutation functions, not just the menu. Add isolated repository equivalents of leads, email addresses, campaign recipients and import history: existing `leads` are public enquiry records and `lead_emails` is a sent-email log, so neither is appropriate for purchased CRM data. Reuse existing campaigns where safe, without changing their sending behaviour.
2. **Lossless, repeatable import.** Inspect the three actual CSVs; preserve UTF-8, all original columns and complete source rows alongside searchable normalized fields. Store stable lead keys, normalized email keys, source filenames/export dates/fields, original validation statuses and compliance-review provenance. Link each email to its lead; repeated identical imports skip existing rows. Reject/report malformed rows and missing lead links, never silently drop fields. Show imported/skipped/errored counts per file and record an import audit event.
3. **Repository interface.** Add a responsive searchable, paginated table with owner/founder, company, industry, location, validation and compliance filters. A detail panel shows all contact fields, source provenance, attached addresses and review history. Use current FastMedia admin styles and Czech/English/German language selection. Exports require admin access, warn about personal data and are audited; nothing appears on public pages.
4. **Legal review and objections.** Default every contact to HOLD / UNASSESSED regardless of CSV email validity. Store purpose, source URL, collection date, lawful basis, legitimate-interest assessment, consent evidence/source/time/scope/controller, country-specific ePrivacy assessment, notice date/route, reviewer identity/notes and objection/unsubscribe timestamps. Require documented channel permission separately from GDPR lawful basis. Display the Czech warning: public/purchased emails and email consent requests do not establish permission; prior consent or the narrow existing-customer exception must be documented. Other countries require their own review.
5. **Global suppression.** One-click objection/unsubscribe processing immediately records suppression, timestamp and audit event. Reuse the existing global suppression mechanism where its schema permits, with independently retained evidence and no cascading deletion from leads. Repository eligibility always checks global suppression; integrate objection blocking with existing campaign readers where needed, without enabling new sending.
6. **Dry-run campaigns only.** Add draft recipient selection and a per-address decision preview showing every blocking reason. Validate documented legal review, channel evidence, national law, privacy notice and suppression server-side. Keep activation, live queueing and sending disabled even for legally reviewed records. Draft message review captures sender/promoted entity, commercial identification, effective reply-to/unsubscribe route and logs decisions/message revisions; no send timestamps are invented. There is no public unsubscribe endpoint until an actual reviewed sending workflow requires secure recipient-specific tokens.
7. **Final verification and report.** Test anonymous, ordinary-user, editor/moderator and admin access; immutable HOLD defaults, repeat-import deduplication, Czech permission rules, suppression persistence and inability to activate/send. Exercise the signed-in desktop/mobile flow, actual CSV import and dry run; inspect the automatic build. Report files, migrations/tables, policies, each file's counts and remaining manual legal review.

## Technical details
- Additive PostgreSQL migrations only; explicit grants followed by RLS on every new public table. No foreign keys from repository records to `auth.users`.
- Admin-only validated mutation functions enforce review and import rules. Audit records are append-only to users and minimize duplicated personal data.
- Raw source rows are private database JSON, not checked into source or served as downloadable public assets.
- Suppression is retained independently; no automated deletion of objection evidence. Retention duration needs controller/legal review, not an invented fixed term.
- Preserve existing app routes, authentication, language behaviour and send integrations; fix only directly relevant safeguard gaps.

## Acceptance criteria
- Non-admin sessions cannot read or mutate repository data even through direct requests.
- All supplied fields remain recoverable; Czech diacritics survive import/readback/export; the second identical import inserts zero duplicates.
- Valid email status alone never clears HOLD or authorizes a campaign. Czech consent/customer-exception and country-specific evidence checks fail closed.
- An objection blocks the normalized address across future campaigns and survives removal of its original lead.
- Campaign previews show concrete reasons, but no action can create a live send job or send an email.
- Admin table, detail, review and import work at desktop and phone widths in all three supported languages.

## Blockers and boundaries
- Reattach the three CSVs to complete field mapping and real-data import; imported counts are currently **0**, not a completed import.
- A privileged human must assess legal basis, channel permission, national-law requirements and retention. The app records evidence; it does not give a legal clearance guarantee.
- Implementation uses Build credits; pure code portions can instead be implemented via ChatGPT/Git. No paid external service or irreversible action is planned.
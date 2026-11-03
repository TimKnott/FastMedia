# Email Design Studio — implementation plan (planning only)

No code was changed, nothing was installed, migrated or deployed. This plan was produced with read-only file inspection only.

## 1. What already exists and can be reused (verified by reading the project)

| Area | Existing module | Reuse |
|---|---|---|
| Studio shell | `src/components/admin/outreach/EmailStudio.tsx` (435 lines, tabbed) | Add a new "Design" tab; keep current tabs unchanged |
| Merge logic | `src/lib/emailStudio.ts` — `MERGE_FIELDS`, `renderMerge`, `findPlaceholders`, `parseTable`, `guessMapping`, `checkEmail`, `BUILTIN_TEMPLATES` | Basis for tokens, test data and unresolved-token checks |
| Permissions UI | `PermissionManager.tsx`, `src/lib/permissionManager.ts` | Preflight shows the same eligibility decision |
| Legal gate | `supabase/functions/_shared/legal-eligibility.ts`, `suppression-gate.ts` | Every send/transfer action calls these; no new gate logic |
| Footer / unsubscribe | `_shared/marketing-footer.ts`, `marketing-unsubscribe` function | Footer block is locked and injected server-side |
| Pacing / deliverability | `_shared/send-pacing.ts`, `_shared/deliverability.ts` | Unchanged; designs enter the existing approval queue |
| HTML helpers | `_shared/email-html.ts` | Extend for table-based compiled output |
| Admin auth | `_shared/require-admin.ts`, RBAC roles | All new functions require admin |
| Providers | `vbout-proxy`, `flowlu-admin`/`flowlu-sync`, `gmail-send`/`gmail-sync` | Transfer Centre wraps these; no Mailchimp integration exists yet |
| Sanitiser | `dompurify` already in `package.json` | Replace the current regex-only `<script>` stripping in previews |
| Private media | private video bucket + signed URLs (`video-view`) | Pattern for an image asset bucket (public-read for email images) |

Current gap: preview HTML is sanitised only by a regex removing `<script>`; there is no block model, versioning, or compiled table HTML.

## 2. Architecture

```text
Block editor (JSON document)  -> autosave -> email_designs (+ versions)
        |                                     |
   live preview (sanitised)          compile (server, deterministic)
                                              |
                       table HTML + inline CSS + plain text
                                              |
          preflight (tokens, links, images, footer, legal gate)
                                              |
     Transfer Centre (copy / ZIP / provider sync)   OR   existing approval queue -> send
```

- The design is stored as JSON (rows > columns > blocks with style props). HTML is always generated from JSON, never edited and stored as raw HTML. This makes sanitising and email-client output predictable.
- Compilation runs in one shared module used by both browser preview and an edge function, so the preview and the final output match.

## 3. Phased delivery

### Phase 1 — MVP editor (core value)
- Block palette: section/row (1–3 columns), text, heading, image, button, divider, spacer, footer (locked).
- Drag and drop reorder, duplicate, delete, undo/redo (history stack, ~50 steps), autosave (debounced, 2 s), desktop/mobile preview toggle.
- Style panel: font (safe stacks only), size, weight, colour, alignment, line height, padding, border, background, content width (max 600 px).
- Inline text editing limited to bold, italic, link, line break (no free HTML).
- Compiled output: table-based HTML, inline CSS, plain-text alternative.
- Save, rename, list designs; one-click "send to existing approval queue" (no direct send).

### Phase 2 — Personalisation and preflight
- Tokens from `MERGE_FIELDS` plus spreadsheet columns, each with fallback.
- Simple conditional blocks: show block if field present / equals value. No scripting.
- Preview with test rows (existing CSV/Sheets loader).
- Preflight report (section 6) blocking export and queueing on failures.

### Phase 3 — Library and brand
- Brand kit (logo, colours, fonts, button style, footer identity).
- Image manager (upload, alt text required, size limits).
- Reusable saved blocks, template gallery (convert the 10 existing templates), version history with restore.
- Social links, header, product/content card blocks.

### Phase 4 — Transfer Centre
- Generic export first: HTML file, plain text, ZIP (HTML + images), copy to clipboard.
- Provider integrations only after the capability checklist (section 5) is verified.

## 4. Email-client-safe output and HTML safety
- Layout: nested `<table role="presentation">`, fixed 600 px container, fluid on mobile via a single media query, with the hybrid/fluid approach so clients that strip `<style>` still render one column cleanly.
- All CSS inlined at compile time; `<style>` block only for mobile and dark-mode hints.
- Fonts: web-safe stacks (Arial/Helvetica, Georgia, Verdana); brand fonts only as first choice with fallback.
- Images: absolute https URLs, required alt text, explicit width/height, no background-image dependency for essential content.
- Buttons: table-cell "bulletproof" buttons, not images.
- Prohibited in output: scripts, forms, iframes, embedded video/audio, event handlers, `javascript:` URLs, external CSS. Video is a thumbnail linking to the existing `/v/:token` page.
- Sanitisation: allowlist-based. Text blocks store limited rich text; compile escapes everything else. Preview additionally passes through DOMPurify with an email-specific allowlist and renders inside a sandboxed iframe.
- Contrast check against WCAG AA (4.5:1 body text) with a warning, not silent change.
- Dark mode: add `color-scheme` meta and notes; avoid transparent logos on dark backgrounds; preflight warns.

## 5. Provider Transfer Centre — capability verification checklist
Nothing below is assumed. Each item must be checked against the provider's current official API docs and the user's account plan before building.

**Generic (always available, no API)**: HTML download, plain text, ZIP, clipboard. This is the default route.

**Mailchimp** (no integration exists today)
- Confirm Marketing API template create/update endpoint and HTML size limits.
- Confirm whether "classic" HTML templates or only the new builder accept imported HTML on the user's plan.
- Confirm image hosting route (Content Studio upload API) vs external URLs.
- Confirm OAuth 2 app registration vs API key; key must live only in server secrets.
- Confirm merge-tag syntax mapping (`*|FNAME|*`) and required footer/address tags.
- Decide: template sync only, never campaign send from here.

**VBOUT** (existing `vbout-proxy`)
- Confirm whether the API supports creating/updating email templates or only campaigns/contacts.
- Confirm HTML import limits and merge-tag syntax.
- Confirm current rate limit (project notes say 13 req/s).
- If no template endpoint: HTML copy/ZIP handoff only.

**Flowlu** (existing functions; API key saved but untested)
- Confirm whether Flowlu has any email template/campaign API at all. Likely treat as CRM record/note attachment only.
- Confirm current key works (read-only call) before relying on it.
- Default: attach compiled HTML as a note/file to a CRM record, or no integration.

**Google Workspace / Gmail** (existing `gmail-send`)
- A sending route, not a campaign manager: no templates, lists or reporting.
- Confirm Gmail API draft creation (`users.drafts.create`) for "create draft in Gmail" handoff.
- Confirm MIME multipart (HTML + text) and size limits, and that existing scopes cover drafts.
- Any send goes through the existing approval queue, pacing, legal gate and suppression.

**Not targeted**: Meta Workplace (discontinued product line; not a current provider). X/Twitter excluded entirely.

Each provider card in the UI shows a verified method label: "API template sync", "Gmail draft", "Import HTML manually", or "Not supported", plus last-verified date.

## 6. Preflight and safety
Blocking checks (export, transfer and queueing stop until fixed):
- Unresolved or unknown tokens; tokens without fallback where data is missing.
- Missing alt text, non-https or unreachable images, broken or `javascript:` links.
- Locked legal footer present: sender identity, postal/contact address, unsubscribe link.
- From/reply-to identity matches verified sender (support@fastmedia.pro).
- Marketing designs: recipient set passes `legal-eligibility` and suppression server-side; blocked recipients excluded with visible reasons.

Warnings: size over ~100 KB (Gmail clipping), contrast, dark-mode logo, image-heavy ratio, spammy subject terms (reuse `checkEmail`).

Test send: only to the admin's own address, via explicit button, labelled "test", logged; never to prospects.

Transfers to external providers are copies of design only — never recipient lists — and are labelled "permission and unsubscribe must be handled by the receiving platform". No real send without explicit human approval in the existing queue.

## 7. Data, security and reliability
New tables (all RLS enabled, admin-only, explicit grants):
- `email_designs` — id, name, kind (marketing/transactional), document JSON, brand_kit_id, status, owner, timestamps.
- `email_design_versions` — append-only snapshots, created_by, note.
- `email_brand_kits`, `email_saved_blocks`, `email_assets` (storage path, alt, size, dimensions).
- `email_transfers` — design_version_id, provider, method, idempotency_key (unique), status, provider_ref, error, attempts, created_by.
- `provider_connections` status only (no secrets); tokens stored in server secrets / server-side connector.

Rules:
- Compile and transfer run in admin-only edge functions (`require-admin`).
- No provider tokens in browser or local storage.
- Transfers idempotent via key = design version + provider; retries with backoff, max 3; failures logged with readable reason.
- Audit log entries for save, restore, export, transfer, test send.
- Marketing vs transactional designs kept separate; transactional designs cannot enter marketing queue and vice versa.

## 8. Dependencies and cost-saving choices
- Prefer no new dependencies: drag and drop via native HTML5 drag events + existing UI components; DOMPurify already present.
- Optional only if native DnD proves unreliable: `@dnd-kit/core` (small, well-maintained).
- Avoid heavy builders (GrapesJS, Unlayer, paid embeds) — cost, licensing, and loss of gate control.
- Do not add an MJML/juice dependency at first; own compiler is small because the block set is fixed.
- Credit savers: Phases 1–2 first; template conversion and copy can be done externally (ChatGPT/Git) without Build credits; provider work only after checklist verification.

## 9. Likely files (proposed, not created)
- `src/lib/emailDesign/` — `schema.ts`, `compile.ts`, `tokens.ts`, `preflight.ts`, `sanitize.ts`
- `src/components/admin/outreach/design/` — `DesignStudio.tsx`, `BlockPalette.tsx`, `Canvas.tsx`, `StylePanel.tsx`, `PreviewFrame.tsx`, `PreflightPanel.tsx`, `TransferCentre.tsx`, `VersionHistory.tsx`, `AssetManager.tsx`
- `supabase/functions/email-design-compile/`, `email-design-transfer/`
- `src/test/emailDesign*.test.ts`

## 10. Acceptance criteria
- An admin can build an email from blocks, reorder/undo/redo, and it autosaves; reload restores it.
- Desktop and mobile previews match compiled output.
- Compiled HTML contains no script, form, iframe, event handler or `javascript:` URL (test).
- Every image has alt text and absolute https URL, or export is blocked (test).
- Unresolved tokens block export and queueing (test).
- Missing legal footer/unsubscribe blocks marketing export (test).
- A marketing design cannot reach any send path for a recipient who fails the legal gate or is suppressed (test reusing existing gate tests).
- Transfers never include recipient data; retrying a transfer does not create duplicates (test).
- Non-admins cannot read or write any new table (RLS test).
- Czech, English and German labels present.

## 11. Risks
- Email-client rendering differences (Outlook desktop) — mitigate with table layout and manual checks in a few real clients.
- Provider APIs may not support template import — fall back to HTML/ZIP handoff.
- Flowlu key still untested.
- Scope creep: the full feature is large; Phase 1 alone is the realistic first build.

Confirmation: no code was changed and no Build credits were spent on implementation in producing this plan.

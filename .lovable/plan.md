# Fix auto-draft email flow + portal language

Three real bugs are hitting your client:

1. **404 "Oops, page not found"** — the admin notification email links to `/admin/clients/:id`, but the actual route is `/admin/client-projects/:id`. The client never had any link sent at all.
2. **No draft agreement shown** — `client_projects.agreement_template` is left empty when auto-created, so the "Agreement" button never appears in the portal.
3. **Czech language** — the portal page is English, but it embeds `https://fastmedia.pro` in an iframe. The marketing site reads `localStorage 'fastmedia-language'` from the visitor's browser, so a Czech visitor sees Czech inside the iframe. The portal shell itself never forces a language.

## Fixes

### 1. `supabase/functions/score-lead/index.ts` (auto-promotion block)

For hot / high_priority leads:

- Use the correct admin URL: `https://fastmedia.pro/admin/client-projects/<id>`.
- Populate `agreement_template` with `DEFAULT_AGREEMENT_TEMPLATE` (inlined as a constant in the edge function — it's a static string, no React import needed) so the portal "Agreement" button shows immediately.
- Issue a portal access token by inserting directly into `project_access_tokens` (32-byte hex, 30-day expiry, email = client email).
- Build the branded portal URL: `https://fastmedia.pro/portal/<slug>/<token>`.
- Send the **client** a `client-stage-update` email (audience `client`, stage `draft_created`) with that portal URL — this is the email that actually opens the draft.
- Send the **admin** the existing `client-stage-update` admin email but pointed at `/admin/client-projects/<id>` (the working route).
- Keep `intake-received` and `lead-notification` as already wired.

### 2. `src/pages/portal/ClientPortal.tsx`

Force British English on the portal regardless of the visitor's stored preference:

- On mount, write `'en'` to `localStorage` under key `fastmedia-language` before the iframe loads, and set `<html lang="en-GB">` via a `useEffect`.
- Add `?lang=en` to the iframe `src` so the marketing site picks it up server-side too.
- Show the agreement dialog automatically the first time the client lands (already wired via `useEffect` on `agreement_template`), and label the button "View draft agreement" instead of just "Agreement" when not yet acknowledged so it's obvious.

### 3. Marketing site language honour

In `src/contexts/LanguageContext.tsx` (or wherever `fastmedia-language` is read), honour `?lang=en` query param on first load and persist it. This guarantees the iframe is English even if the visitor previously had Czech.

## Files touched

- `supabase/functions/score-lead/index.ts` — fix URL, add agreement_template + portal token + client email
- `src/pages/portal/ClientPortal.tsx` — force English, clearer CTA
- `src/contexts/LanguageContext.tsx` — respect `?lang=` query param

## Out of scope

No DB migration needed — all fields already exist. No new email template needed — `client-stage-update` already covers `draft_created` for both audiences.

## How you'll verify

1. Submit a fresh intake that scores ≥ 50.
2. Admin inbox: link opens `/admin/client-projects/<id>` (no 404), draft already populated.
3. Client inbox: separate email with the branded `/portal/<slug>/<token>` link → opens portal in English, "View draft agreement" dialog auto-opens.   Make sure that British English is the only language for the entire website including reports etc.  all other languages must be removed
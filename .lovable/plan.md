
## Goal

A private, token-protected showcase served from `fastmedia.pro`. Each project has its own URL like `fastmedia.pro/showcase/<slug>?k=<token>` that renders the Lovable project inside a full-screen iframe — the address bar always shows your domain and the project slug, never `lovable.dev`. A back-office page lets you add, edit, remove, and rotate tokens without touching code.

## Why the previous attempt 404'd

The earlier build dropped a `public/showcase.html` file. In a Vite SPA, requests under your domain are handled by React Router (SPA fallback to `index.html`), so visiting `/showcase` or `/showcase/<slug>` never reached the static HTML and React had no matching route → NotFound. The fix is to make showcase a real React route, not a static HTML file.

## Important compatibility note (please confirm)

Browsers only allow embedding a site in an iframe when that site permits it (no `X-Frame-Options: DENY/SAMEORIGIN` and no restrictive `frame-ancestors` CSP).

- Lovable **editor** URLs (`https://lovable.dev/projects/<id>`) require login and block iframing — these will show a blank/refused frame.
- Lovable **published** URLs (`*.lovable.app` or your own custom domain attached to that project) generally can be embedded.

For the showcase to actually display the project, each entry should point at the project's **published URL**, not the editor URL. The admin form will accept any URL but I'll add a warning when an editor-style URL is detected.

## What gets built

### 1. Database (new table `showcase_projects`)

Fields: `name`, `slug` (unique, used in URL), `lovable_url` (the embedded URL), `access_token` (random, required to view), `is_active`, plus standard timestamps and `created_by`. RLS:
- Editors/admins: full manage.
- Anonymous: no direct table access.
- Public viewing happens through a small edge function that checks `slug + token` server-side and returns `{ name, lovable_url }` only when valid — the token is never exposed in table reads.

### 2. Public routes (React Router)

- `/showcase/:slug` — reads `?k=<token>` from the query string, calls the edge function to validate, then renders a full-viewport iframe of the returned `lovable_url`. Sets `<title>` to the project name. Shows a clean "Link invalid or expired" screen on failure. No nav, no footer, no breadcrumbs — just the iframe (matches your existing `showcase.html` styling).
- The URL stays `fastmedia.pro/showcase/<slug>?k=…` the whole time; the iframe's `src` is not visible in the address bar.

Optional: also accept `/s/:slug/:token` if you'd rather have the token in the path than the query — say the word and I'll use that shape instead.

### 3. Edge function `showcase-access`

Single POST endpoint, public (no JWT). Body `{ slug, token }`. Looks up the row, compares token in constant time, returns `{ name, url }` or 404. Logs failed attempts to `project_audit_log` for visibility.

### 4. Admin page `/admin/showcase`

Behind the existing `ProtectedRoute minRole="editor"`. Lets you:
- List all showcase entries with name, slug, target URL, active toggle, created date.
- Add / edit / delete entries.
- Auto-generate slug from name (editable).
- Auto-generate a strong random token on create; **Rotate token** button to invalidate the old link and produce a new one.
- **Copy link** button that copies the full `https://fastmedia.pro/showcase/<slug>?k=<token>` URL.
- Inline warning if the `lovable_url` looks like an editor URL (`lovable.dev/projects/...`) suggesting the published URL instead.

A "Showcase" item is added to `AdminSidebar`.

### 5. SEO / privacy

- `noindex, nofollow` meta on `/showcase/*` pages.
- `public/robots.txt` updated to disallow `/showcase/`.
- Pages render minimally (no analytics on the iframe page) for fast load.

## Files

- New: `supabase/functions/showcase-access/index.ts`
- New: `src/pages/Showcase.tsx` (public iframe page)
- New: `src/pages/admin/AdminShowcase.tsx`
- Edit: `src/App.tsx` (add `/showcase/:slug` and `/admin/showcase` routes, lazy)
- Edit: `src/components/admin/AdminSidebar.tsx` (menu entry)
- Edit: `public/robots.txt`
- Delete: `public/showcase.html` (replaced by the React route)
- Migration: create `showcase_projects` table + RLS

## Out of scope / will not do unless asked

- Password-protect-on-form flow (you asked for link-based access; tokens in the link satisfy that).
- Server-rendered HTML at the edge (Lovable hosting is SPA; the React route gives the same UX with proper SPA fallback so links work on refresh).
- Proxying Lovable's HTML through your domain to hide the iframe `src` from devtools — not feasible without breaking the project's auth/cookies; the address bar will already only show your domain, which is what you asked for.

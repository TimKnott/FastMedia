## Two parts: fix the root cause, then automate the checks

### Part A — Eliminate the issues at the source (prerender)
*(Same as the previous plan — included here because the daily monitor is pointless if the underlying SPA still ships identical HTML for every URL.)*

1. **`scripts/prerender.ts`** (new), wired as `postbuild`. After `vite build`, generates one `dist/<route>/index.html` per route with that route's unique `<title>`, `<meta description>`, `<link canonical>` (no trailing slash, www variant), `<meta og:*>`, `<meta twitter:*>`, and route-appropriate JSON-LD (`Article` for blog posts, `Service`/`LocalBusiness` for demos, `Product` for packages, `FAQPage` where it fits).
2. **`scripts/seo-routes.ts`** (new) — single source of truth for routes. Static routes are hardcoded; dynamic routes (blog articles, legal docs, custom demos) are pulled at build time from Supabase using the anon key.
3. **`index.html`** — drop the hardcoded canonical/title/og:url so the prerender always wins; keep only sitewide tags (charset, viewport, theme-color, favicon, PWA).
4. **`public/robots.txt`** — add `Disallow: /404`.
5. **404 mitigation** — prerender `dist/404.html` with `noindex,nofollow` and `prerender-status-code: 404`.

### Part B — In-app daily SEO monitor (the part you asked for)

A scheduled crawler that does what SiteGuru does, but inside the app, free, and on your timing.

#### New tables (one migration)

- `seo_audit_runs` — one row per scheduled run (`started_at`, `finished_at`, `urls_checked`, `issues_found`, `health_score`, `triggered_by`).
- `seo_audit_findings` — one row per (run, url, check). Columns: `run_id`, `url`, `check_id` (e.g. `canonical_missing`, `title_duplicate`, `description_missing`, `h1_missing`, `h1_multiple`, `og_missing`, `jsonld_missing`, `trailing_slash_dupe`, `noindex_unexpected`, `status_code_unexpected`), `severity` (`high|medium|low`), `current_value`, `expected_value`, `first_seen_at`, `last_seen_at`, `resolved_at`.

Both tables are admin-read-only via RLS (super_admin + admin); writes only from edge functions via service role.

#### New edge function: `seo-daily-audit`

Runs the crawl. Logic:

1. Read the route list from the published sitemap (`public/sitemap.xml` + edge-function sitemap), de-duplicated.
2. For each URL, `fetch()` it server-side (no JS execution — exactly like SiteGuru).
3. Parse with a lightweight HTML parser (no Puppeteer needed). Check:
   - Single `<link rel="canonical">` present, points to www, no trailing slash, matches the URL being audited.
   - `<title>` present, length 30–65, unique across the site.
   - `<meta name="description">` present, length 70–160, unique.
   - Exactly one `<h1>` per page.
   - `og:title`, `og:description`, `og:url`, `og:image`, `og:type` all present.
   - At least one valid `<script type="application/ld+json">` block.
   - HTTP status is 200 (or expected redirect target).
   - Trailing-slash twin returns the *same canonical* (catches duplicates).
   - Page is not unexpectedly `noindex`.
4. Insert one `seo_audit_findings` row per failing check, deduped by `(url, check_id)` using `first_seen_at` / `last_seen_at` so recurring issues don't spam.
5. Compute a 0–100 health score (weighted by severity) and write the run summary.
6. If health score drops > 10 points day-over-day, or any High-severity findings appear, send an email via the existing `notify-admin` function (and optionally write to `seo_alerts_log`, which already exists).

#### Scheduling

Use the existing `pg_cron` + `pg_net` pattern (already in the project):

```sql
select cron.schedule(
  'seo-daily-audit',
  '0 6 * * *',  -- 06:00 UTC daily
  $$ select net.http_post(
       url := 'https://<ref>.supabase.co/functions/v1/seo-daily-audit',
       headers := '{"Content-Type":"application/json","apikey":"<anon>"}'::jsonb
     ); $$
);
```

#### Admin UI

Extend the existing `AdminSEO` / `AdminSEOInsights` page with a new tab **"SEO Health Monitor"**:

- Big health-score gauge (matches SiteGuru's 39%-style read-out).
- "Last run", "Next run", and a **Run now** button (calls `seo-daily-audit` immediately).
- Findings table grouped by check: e.g. "Duplicate canonical (12 pages)" → expandable list of URLs.
- Trend chart of health score over the last 30 runs.
- Per-finding **"Mark as fixed"** button that writes `resolved_at`; the next run re-verifies and reopens if still broken.
- Per-finding **"Ignore"** with a required reason (so we can suppress intentional cases without losing the audit trail).

#### Optional, can wait

- A PageSpeed Insights check using the existing `seo-pagespeed` function so the daily run also stores per-URL performance scores. You already pay for nothing — Google's PSI API is free with a key.

---

## Technical details

**New files**
- `scripts/prerender.ts`, `scripts/seo-routes.ts`
- `supabase/functions/seo-daily-audit/index.ts`
- `src/pages/admin/AdminSEOHealth.tsx` (new tab)
- `src/components/admin/SEOHealthGauge.tsx`, `SEOFindingsTable.tsx`

**Edited files**
- `package.json` — `"postbuild": "tsx scripts/prerender.ts"`
- `index.html` — strip hardcoded canonical/title (kept as sitewide fallback only)
- `src/App.tsx` — add `/admin/seo-health` route
- `src/components/admin/AdminSidebar.tsx` — link to new page
- `public/robots.txt` — `Disallow: /404`

**One migration**
- Create `seo_audit_runs`, `seo_audit_findings`, RLS policies, GRANTs, plus the `pg_cron` schedule.

**No new secrets** — uses existing Supabase service-role key and anon key.

---

## What you get

| Today | After |
|---|---|
| External SiteGuru scan, manual, daily nag | Daily in-app crawl, auto email if health drops |
| Same issues re-flagged because SPA serves identical HTML | Prerender writes per-route HTML — issues are *actually* gone, not just patched in JS |
| No history of what regressed when | `seo_audit_runs` keeps 30+ days of trend |
| No alerting | High-severity finding → email via existing `notify-admin` |
| Can't easily mark intentional cases | Per-finding ignore-with-reason |

## What this won't do

- Backlink audit — needs external data (Semrush/Ahrefs). You already have a Semrush connector wired up; we can pull from there if you want, but it's a separate workstream.
- Google ranking position — requires GSC connector (already linked); existing `seo-sync-gsc` covers it.
- Visual regression / Core Web Vitals over time — PSI tab is a stretch goal above.

---

**Two clarifying questions before I implement:**

1. **Scope confirmation** — do you want **both parts** (the prerender fix *and* the daily monitor), or just the monitor? My strong recommendation is both: a monitor without the prerender will just keep finding the same issues every day.
2. **Alert channel** — email to `support@fastmedia.pro` only, or also push to the admin inbox component you already have (`SuperAdminInboxBadge`)?

Approve and tell me on those two and I'll implement.
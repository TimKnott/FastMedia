
# SEO + E-A-T Monitoring Dashboard

A back-office tool at **`/admin/seo`** that runs weekly automated scans against Google Search Console + Semrush + your own site, stores historical snapshots, and surfaces prioritised fixes.

## Feasibility & Recommended Frequency

- **Fully feasible.** GSC connector is already linked (`GOOGLE_SEARCH_CONSOLE_API_KEY`), Semrush connector is available for backlink/authority data, and Lovable Cloud (Supabase) handles scheduling via `pg_cron` + edge functions.
- **Recommended cadence:** **weekly for performance/coverage** (GSC data has ~2-3 day lag, so more frequent adds little signal), **daily for crawl-error & security alerts** (so you find regressions fast), **monthly for E-A-T audit** (changes slowly). Configurable per-job.

## Scope (Phase 1 — what this plan covers)

### 1. Search Console weekly sync
Edge function `seo-sync-gsc` pulls per property:
- Top keywords (query, clicks, impressions, CTR, avg position)
- Clicks/impressions time series (28-day trailing)
- Top pages, device split, country split
- Index coverage summary via `urlInspection` for a configurable URL list
- Sitemap list + last-read status + error counts
- Stored in `seo_snapshots` (one row per week per property per dimension)

### 2. E-A-T weekly audit
Edge function `seo-audit-eat` runs per property:
- **Site signals** — fetches homepage + key URLs, checks: HTTPS, JSON-LD presence (Organization, Person, Article author), contact page reachable, privacy/terms links, sameAs profiles, secure headers
- **Authoritativeness** — calls Semrush `backlink_analysis` for authority score, referring domains, follow/nofollow ratio, top anchors
- **Expertise** — scans blog posts for author byline + credentials field (uses existing blog schema)
- Each check produces a 0-100 sub-score; overall E-A-T health score stored in `eat_audits`

### 3. Issue queue & alerts
- `seo_issues` table — every problem detected (crawl error, missing schema, weak backlink profile, broken sitemap, indexing drop >20%, traffic drop >25% WoW) becomes a row with severity (critical/warning/info), category, suggested fix, status (open/snoozed/resolved)
- Critical issues trigger email to `support@fastmedia.pro` via existing email queue
- Dashboard groups by severity, lets you mark resolved or snooze

### 4. Dashboard UI (`/admin/seo`)
- **Overview tab** — health-score gauges (Search visibility, Index health, E-A-T), 28-day clicks/impressions sparkline, top 5 critical issues
- **Performance tab** — keywords table (sortable, searchable), top pages, device + country breakdown, WoW deltas
- **Coverage tab** — sitemap status, indexed-vs-submitted, per-URL inspection results, "Request indexing" button (calls GSC URL Inspection API)
- **E-A-T tab** — checklist with pass/fail per signal, backlink summary, author coverage on blog
- **Issues tab** — filterable issue queue with bulk actions
- **Properties tab** — list connected GSC properties, manual "Run sync now" button per property
- Export: CSV per table, PDF for the Overview tab (jsPDF, matches existing accounting export style)
- Mobile-responsive, semantic tokens, admin-only via existing `has_role('admin')`

### 5. Scheduling
- `pg_cron` + `pg_net` extensions enabled
- Three jobs:
  - `seo-sync-gsc` — weekly Monday 06:00 UTC
  - `seo-crawl-check` — daily 06:00 UTC (lightweight: only inspection errors + traffic-delta alerts)
  - `seo-audit-eat` — monthly 1st 06:00 UTC
- "Run now" button in admin triggers the same edge function on demand

## Out of scope for Phase 1 (can add later)
- Google Analytics 4 integration (requires new connector + per-property auth)
- Per-end-user OAuth (your workspace connector is sufficient for an admin dashboard)
- Multi-tenant: the dashboard manages **your** GSC properties; not a SaaS for clients

## Technical notes

**Tables (new):**
- `seo_properties` (gsc site URL, display name, active)
- `seo_snapshots` (property_id, week_start, dimension: 'keyword'|'page'|'device'|'country', metrics jsonb)
- `seo_index_status` (property_id, url, last_crawl, coverage_state, indexed bool, checked_at)
- `seo_sitemaps` (property_id, sitemap_url, last_submitted, last_downloaded, errors, warnings)
- `eat_audits` (property_id, run_at, overall_score, signals jsonb)
- `seo_issues` (property_id, severity, category, title, detail, suggested_fix, status, created_at, resolved_at)

All RESTRICTIVE RLS, admin-only read, service_role only write — matches your existing security memory pattern.

**Edge functions (new):**
- `seo-sync-gsc` — orchestrates GSC fetches via gateway
- `seo-audit-eat` — runs E-A-T checks (uses Semrush gateway + fetches site HTML)
- `seo-request-indexing` — wraps `urlNotifications:publish` for manual reindex
- `seo-run-now` — admin-invoked, dispatches any of the above

**Frontend:**
- New routes under `src/pages/admin/seo/` (Overview, Performance, Coverage, EAT, Issues, Properties)
- Adds entry to AdminSidebar
- Uses Recharts (already in project) for time series
- React Query for data fetching

## Implementation phases (so we don't blow credits in one shot)
1. **Foundation** — migrations + `seo_properties` CRUD + property picker UI
2. **GSC sync** — edge function + Performance + Coverage tabs
3. **Scheduling + Issues** — pg_cron + issue detection + Issues tab + email alerts
4. **E-A-T audit** — edge function + EAT tab + Semrush integration
5. **Exports + polish** — CSV/PDF, mobile pass, copy review

Each phase ends with verification (build green, manual smoke-test of new tab) before moving on.

---

**Approve this plan and I'll start with Phase 1 (foundation + migrations).** If you'd rather build it all in one go, say so — I'll just warn it'll be a long single iteration.

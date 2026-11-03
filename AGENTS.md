# Project Architecture Rules

- Prospect dispatch uses a service-only database worker lease and conditional per-message claim; approval wakes a bounded minute scheduler that unschedules after drain, preserving shared caps/gaps and preventing duplicate provider dispatch.

- Lead Repository tables and validated admin RPCs are isolated from enquiry/prospect sending tables; source CSV fields remain private JSON provenance, global objections write to suppressed_emails, and campaigns/recipients stay constrained to DRY_RUN/HOLD with NULL sent_at so email validity cannot activate sending.

- SEO initial HTML uses scripts/seo-routes.ts and scripts/seo-html.ts inside the existing prerender step; fallbacks must be accessible to all visitors, mirror real content, and never use bot-specific rendering or invented claims.
- Keep public/sitemap.xml as the primary static sitemap; the prerender-generated sitemap-content.xml supplements published dynamic content without replacing that mechanism. Lastmod requires a significant page-specific modification timestamp, never generation time.

- The business campaign reads its confirmed service scope from `businessSubscription`; this describes the enquiry offer, not checkout pricing, so unrelated payment plans remain unchanged.

- Public language selection and canonical translated URLs use the shared publicLanguage helper; publish language alternatives only for explicitly translated paths to avoid indexing untranslated pages.
- Dynamic SEO snapshots isolate each public-content fetch; translated sibling alternatives share one helper in preview and prerender, never guessing an original page's language.

- Keep the public launch experience at `/launch`; the homepage may preview it, while press assets remain at `/media-kit`.
- Monthly launch themes are selected from the visitor's calendar month so the presentation changes without a scheduled backend job.
- Case-study galleries store ordered screenshot metadata on each case-study record so public presentation and admin editing remain in sync.- The service worker never serves pages from an offline copy (network-first navigations, no HTML precache) and index.html carries a boot watchdog that clears caches and reloads once if the app fails to start — stale cached pages after releases caused blank screens.
- Campaign Studio stages/tool mapping live in src/lib/campaignStudio.ts and reuse existing admin pages; external send/publish is only ever recorded after explicit approval, never triggered automatically.
- Public partner signup/referral go through validated security-definer RPCs (register_partner, submit_referral, get_partner_programme_public); partner tables stay admin-only.
- Cold-email studio (src/components/admin/outreach, src/lib/emailStudio.ts) only drafts and copies emails; sending stays in the approval-gated outreach queue so nothing goes out unapproved. Personal videos are served via the public video-view function with signed URLs from a private bucket.
- Promotional email legality is enforced server-side by supabase/functions/_shared/legal-eligibility.ts against marketing_permissions (append-only audited) at approval and immediately before every send; it fails closed so public/enriched data never becomes permission.

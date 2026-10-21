# Project Architecture Rules

- The business campaign reads its confirmed service scope from `businessSubscription`; this describes the enquiry offer, not checkout pricing, so unrelated payment plans remain unchanged.

- Public language selection and canonical translated URLs use the shared publicLanguage helper; publish language alternatives only for explicitly translated paths to avoid indexing untranslated pages.

- Keep the public launch experience at `/launch`; the homepage may preview it, while press assets remain at `/media-kit`.
- Monthly launch themes are selected from the visitor's calendar month so the presentation changes without a scheduled backend job.
- Case-study galleries store ordered screenshot metadata on each case-study record so public presentation and admin editing remain in sync.- The service worker never serves pages from an offline copy (network-first navigations, no HTML precache) and index.html carries a boot watchdog that clears caches and reloads once if the app fails to start — stale cached pages after releases caused blank screens.
- Campaign Studio stages/tool mapping live in src/lib/campaignStudio.ts and reuse existing admin pages; external send/publish is only ever recorded after explicit approval, never triggered automatically.
- Public partner signup/referral go through validated security-definer RPCs (register_partner, submit_referral, get_partner_programme_public); partner tables stay admin-only.

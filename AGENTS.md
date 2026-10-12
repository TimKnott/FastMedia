# Project Architecture Rules

- Keep the public launch experience at `/launch`; the homepage may preview it, while press assets remain at `/media-kit`.
- Monthly launch themes are selected from the visitor's calendar month so the presentation changes without a scheduled backend job.
- Case-study galleries store ordered screenshot metadata on each case-study record so public presentation and admin editing remain in sync.- The service worker never serves pages from an offline copy (network-first navigations, no HTML precache) and index.html carries a boot watchdog that clears caches and reloads once if the app fails to start — stale cached pages after releases caused blank screens.

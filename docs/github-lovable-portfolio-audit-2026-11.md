# GitHub / Lovable portfolio audit — 15 November 2026

## Inventory (10 repositories, owner TimKnott)
| Repository | Role | Findings |
| --- | --- | --- |
| koneastaje | Production directory | Supabase config `eoikoegidkgagqpkcrst`; draft PR #12 for review-only discovery bot; production database not available via connected Supabase plugin |
| FastMedia | Main agency website | Supabase config `aivnnjsrupmubcjsgulb` |
| seven-hour-teacher | Teacher platform | Supabase config `ukmpjeofbmarmmtadyhy` |
| theprogenitors | History platform | Supabase config `zbexmhrghgcrtffiepvv`; connected Supabase plugin shows a *different* project named Progenitors Project (`hbfihpvbtnouolbysfii`) |
| booking-studio | Booking pilot | No `supabase/config.toml` found; determine backend |
| obecweb-municipal-platform | Municipal platform | Supabase config `hbfihpvbtnouolbysfii`, **same ID as connected Supabase project named Progenitors Project**; check intended tenancy before any writes |
| obecweb | Placeholder | Reported size 0; review before archiving |
| fastmedia-ugc-studio | Placeholder | Reported size 0; review before archiving |
| fastmedia-ugc-studio-clean | Placeholder | Reported size 0; review before archiving |
| fastmedia-api-integration-demo | Placeholder | Reported size 0; public; review before archiving |

All are currently under the personal `TimKnott` GitHub owner. Do **not** transfer to a new organisation or rename repositories without checking Lovable sync/deployment integrations, callback URLs, branch protection and external references.

## Recommended grouping (no ownership changes yet)
- **Live customer-facing:** FastMedia, koneastaje, seven-hour-teacher, theprogenitors.
- **Pilots / internal tools:** booking-studio, obecweb-municipal-platform.
- **Placeholders / cleanup candidates:** obecweb, fastmedia-ugc-studio, fastmedia-ugc-studio-clean, fastmedia-api-integration-demo.

## Important limitations
GitHub repository access proves code availability, **not** that a Lovable site is deployed, healthy or syncing. Project IDs in config files do not establish actual runtime environment settings. No builds, workflow runs, site smoke tests, or production database writes were performed during this audit.

## Action plan
1. Resolve ObecWeb vs Progenitors project-ID discrepancy with Lovable Cloud project settings and runtime environment, **before** deploying ObecWeb.
2. Reconnect the correct Koně a Stáje Lovable Cloud database through authorised access; review and test draft PR #12 before merge.
3. For each live site, verify Lovable linked repository/branch, last sync SHA, runtime Supabase URL, deployment URL, build logs, domain, auth, and one representative read-only user journey.
4. Add a standard minimal CI workflow per repo, only after confirming package manager and lockfile; do not create workflows blindly.
5. Consider GitHub topics and descriptions for grouping. Archive placeholders only after owner review; transfer to an organisation only as a separate planned migration.

## Cost and safety
Keep Lovable build credits and ChatGPT Work usage minimal. Do not turn on background jobs or production writes. Never expose service-role keys or secrets in repository files.

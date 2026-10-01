# Plan: Get backlinks from your other Lovable projects

## What this covers
Turning your 24 other Lovable projects into real backlinks to fastmedia.pro. There is no true "batch publish" — each project must be edited and published from its own chat — but this plan makes it as close to one-click-per-site as possible.

## What I will do (in this project)

1. **Prepare a ready-to-paste instruction** for each of the 24 projects, saved as a checklist document you can work through. Each instruction tells that project's chat to:
   - Add a small centred footer credit on every page: "Website developed by FastMedia.Pro" linking to https://www.fastmedia.pro (opens in new tab, site's existing footer colours, no extra keywords).
   - Also add the same link as plain HTML inside index.html in a noscript tag, so the link checker can see it (your sites draw the footer after the page loads).
2. **Add the 15 unpublished projects to the Backlink builder** as items 60–74, marked "To do", so the dashboard tracks all 24 sites (9 live ones are already items 51–59).
3. **Verify each link as you publish**: when you send me a live address, I fill it in, run Check link, and it moves to Live on the dashboard automatically.

## What you do (about 5 minutes per site)

1. Open each project in Lovable, paste the instruction from the checklist into its chat.
2. When it's done, click **Publish** in that project (top right).
3. Send me the live address (or just say "done — it's live") and I'll verify it.

## Suggested order

- First: the 9 already-live sites (they only need the footer added + republish).
- Then the 15 unpublished ones, skipping **Temu Style Shop** (a copy of another brand — a credit link there could look odd to Google).

## Honest expectations

- Links from `.lovable.app` addresses are real but carry modest weight with Google. The 50-directory checklist (Firmy.cz, Clutch, Bing Places…) remains the higher-value work.
- Publishing a project makes it publicly visible at its `.lovable.app` address. If any project contains unfinished or private content, check it before publishing.

## Technical details

- New rows in `backlink_opportunities` (is_own_site = true, status 'todo', sort_order 60–74) via a migration with `ON CONFLICT (site_url) DO NOTHING`.
- Checklist delivered as a markdown document in Files.
- No new keys, APIs or costs beyond workspace credits.

# Switch to www.fastmedia.pro + one-week reminder

## 1. Make www the single official address
Visitors already land on www.fastmedia.pro, so every address Google sees will match it.

- Replace `https://fastmedia.pro` with `https://www.fastmedia.pro` everywhere it appears (about 52 places): page list for Google (sitemap), language page list, robots file, page address tags (canonical), language links (hreflang), business details for search engines, share links, email templates, contact card and SEO tools.
- Keep email addresses (support@fastmedia.pro) unchanged — only web addresses change.
- Update the project memory so future work always uses www.
- Publish, then resubmit the sitemap in Google Search Console and notify Bing (IndexNow) with the www addresses.
- Check live: homepage, /about and /eu-creative-grant show www address tags, and the sitemap lists only www.

## 2. Reminder in one week (Fri 2 Oct 2026, 09:00 Prague)
I can't message you in this chat later, but the site can email you.
- A one-off scheduled job emails support@fastmedia.pro on 2 Oct with the open-task checklist, then switches itself off:
  - Request indexing in Search Console (homepage, /eu-creative-grant, /grant-business-plan)
  - Connect Google Business Profile
  - New Flowlu API key + Flowlu web address
  - Connect Twilio
  - Create/switch on the GetSales LinkedIn sequence from the "SEO Experts" list and add the webhook
  - Send the four real case-study PDFs and any client-approved figures
  - Review the EU language drafts
- Sent through the existing Google Workspace email route; a test send is done now so you can see it arrives.

## Technical details
- Bulk replace in src/, public/, supabase/functions/, index.html, scripts/seo-routes.ts; exclude migrations. Redeploy affected edge functions.
- Reminder: small edge function `task-reminder` + pg_cron job scheduled `0 7 2 10 *` that unschedules itself after running.

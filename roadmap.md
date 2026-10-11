# Roadmap

## Voice agent (approved plan 2026-09-24)
- [x] Publish homepage fixes (ISO 27001 removed, British spellings)
- [x] DB tables: voice_settings, voice_calls, voice_call_turns, voice_campaigns, voice_scan_reports (RLS, staff-only)
- [x] Edge function: voice-webhook (inbound/outbound/gather/status, CZ/EN/DE, ElevenLabs voice, AI brain, forward-to-staff, budget cap)
- [x] Edge function: voice-daily-scan (06:30 UTC cron, emails admin on issues + weekly all-clear)
- [x] Edge function: flowlu-sync (no-op until FLOWLU_ACCOUNT + FLOWLU_API_KEY set)
- [x] Admin page /admin/voice-agent: calls + transcripts, campaigns w/ approval, scans, settings
- [x] Monthly minute cap (budget guard, default 120 min)
- [ ] BLOCKED: Twilio account + keys from user (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) — then buy CZ number, point voice webhook at /functions/v1/voice-webhook
- [ ] BLOCKED: Flowlu API key from user (FLOWLU_ACCOUNT, FLOWLU_API_KEY)
- [ ] Carrier call-forwarding instructions for user once number exists

## Deferred
- [ ] Ad Alchemy tracking snippet (deferred at user request)

## AI Search Visibility (GEO)
- [x] Workspace at /admin/geo: audit, facts, claims, plan, competitors, generator, schema, checklist, approvals, AI tracker, exports
- [ ] Owner to confirm business facts (blocks verified drafts)

## Sep 24 batch
- [ ] Flowlu CRM sync admin page (leads + calls), real connection test, webhook — BLOCKED: Flowlu rejects API key
- [x] Grant content pages: EU creative grant, free courses, business plan prompts, language versions — linked from GEO
- [x] Rewrite homepage + grant pages for AI search (direct answers, schema), EU-language GEO entry — publish directly
- [x] Switch EU grant course visible
- [x] Language version generator admin page (drafts, publish after approval)
- [x] Publish + sitemap; tracking of clicks/rankings (Search Console)

## Sep 24 batch 2
- [x] Sync real inbox, verify English translation + Original toggle
- [x] Grant pages in every EU language (drafts via Language versions, bulk) + GEO plan entries + schema
- [ ] Voice agent: Twilio number — BLOCKED waiting for number (needs Twilio credentials), daily scan, Flowlu (blocked on key)
- [x] Publish homepage/SEO content

## Sep 24 batch 3 — AI search readiness (all EU languages)
- [x] Remove/qualify unproven claims (stats, Google Partner, WCAG, demo ratings, reviews hidden)
- [x] Real business details in structured data (IČO, Louny, 24 languages)
- [x] Language writer uses local search wording per language
- [x] Language sitemap with hreflang + IndexNow + weekly visibility agent (Mon 05:15 UTC)
- [ ] Google Search Console property verification — BLOCKED: needs user go-ahead
- [ ] Bing Webmaster Tools, Google Business Profile, LinkedIn/directories — BLOCKED: user must do outside site
- [ ] Case study figures/testimonials evidence — BLOCKED: user must confirm real vs sample

## Sep 24 batch 4
- [ ] Twilio number → voice agent (needs Twilio connection from user)
- [ ] Flowlu key re-entry (current key rejected)
- [ ] Weekly discovery dashboard by language/source
- [ ] Remaining EU language pages EN/CS + hreflang/schema
- [ ] Google Search Console: verify www.fastmedia.pro, submit sitemap (meta tag added, needs publish)
- [ ] LinkedIn outreach sequences for approved leads
- [x] Back-office tool search + "Find leads" menu link

## Sep 25 batch
- [x] /about page (legal entity, Louny address, team, areas served, case studies labelled illustrative)
- [x] DE/PL/SK EU grant pages published (hreflang via language sitemap)
- [x] Critical case-study download finding fixed (signed links via backend)
- [x] Search Console: www.fastmedia.pro verified, added, sitemap submitted
- [ ] Google Business Profile — needs user to connect GBP + complete Google's postcard/video verification
- [ ] Request indexing (homepage, grant pages) — must be done by hand in Search Console URL Inspection
- [ ] Real case-study evidence — needs client-approved figures from user
- [x] Sitemap/canonical URLs use fastmedia.pro but live site redirects to www — align (97 www URLs, 0 bare; robots points to www)

## Sep 25 batch 2
- [x] Switch all addresses to www + resubmit sitemap; reminder email scheduled 2 Oct
- [x] FR/ES/IT EU grant + business-plan pages published (language sitemap, hreflang)
- [x] Industry pages: /websites-for/plumbers, /electricians, /small-service-businesses
- [ ] Full Czech site on its own URL (/cs/...) — awaiting user confirmation (large change)
- [x] Blog narration: replace ElevenLabs with Google voice via Lovable AI

## Sep 29 additions
- [x] Route notification emails to professional address (OWNER_NOTIFICATION_EMAIL) across 8 edge functions — deployed
- [x] Verified: test notification sent to timknott@fastmedia.pro
- [ ] Hair salon through LinkedIn → Flowlu — Flowlu OK; GetSales flow cannot START until user connects their LinkedIn account in GetSales (no sender profiles exist)
- [x] GetSales flow "FastMedia — SEO Experts outreach" CREATED via API (uuid c076d237-ac7f-460d-81d5-bfb0d395ccb9, draft, Prague business-hours schedule); auto-enrol wired: every pushed lead joins the flow (POST /flows/api/flows/{uuid}/leads/{leadUuid} — verified, enrolled=true); Salon Grácie pushed + enrolled
- [ ] GetSales (user): connect LinkedIn account (sender profile) + add message steps to the flow + switch it on — steps have no API endpoint
- [x] Confirm Flowlu account is fastmedia.flowlu.com — verified via flowlu_settings test (906 opportunities)

## Sep 29 Flowlu leads batch
- [ ] Guide: connect timknott@fastmedia.pro mailbox in Flowlu (user action)
- [x] Daily Flowlu lead sync into back office + live "new leads" count
- [x] Draft/send reply editor on each Flowlu lead card (logged back into Flowlu)
- [x] Test send from a real lead card to own inbox, confirm it shows in Flowlu
- [x] Score + priority per Flowlu lead, shown in Leads hub

## Flowlu pipeline (29 Sep)
- [x] Priority column on Leads hub incl. Flowlu leads
- [x] Score/priority written to Flowlu fields
- [x] Sequence draft/approve/send + reply tracking
- [x] Pipeline dashboard
- [ ] User: connect timknott@fastmedia.pro inside Flowlu (Flowlu settings only)

## Sep 30 batch
- [x] Backlink builder: live count + 8-week progress tracker
- [x] Reviews: /reviews submit form, admin approval at /admin/reviews, homepage shows approved only
- [x] Press kit: grant section on /media-kit (also /press)
- [x] Grant client portal — already exists at /grant-portal
- [ ] Firmy.cz tick-off — BLOCKED waiting for user to forward Seznam approval email / listing URL

## Oct 1 batch
- [x] Run the live-link check across the 10 current URLs and report failures — Europages passes; 9 own sites still lack the footer link
- [ ] Add FastMedia footer credits to the 9 published projects — BLOCKED: this project can only read other projects
- [ ] Prepare the remaining 15 unpublished projects for backlinks, then publish and verify them — BLOCKED: this project can only read other projects
- [x] Replace the homepage image-only launch treatment with a real launch video experience
- [x] Build a dedicated launch page with countdown, timeline and press-kit links — countdown rolls automatically to each new monthly theme
- [x] Investigate and mitigate the missing Lovable project thumbnail — crawler now bypasses the old full-screen loading cover; platform cache refresh remains outside project control
- [x] Increase the rocket exhaust to dense, full-width smoke across the launch scene
- [x] Assess a persistent WhatsApp chat option and explain costs/limitations — possible through WhatsApp Business with usage fees; this Lovable chat cannot be moved there

## Oct 1 showcase domain
- [ ] Turn myname.co.uk into a separate public portfolio/testing hub for all published sites
- [ ] Connect myname.co.uk from Namecheap and preserve isolation from FastMedia
- [ ] Add each publication under a clean showcase address as it becomes available
- [ ] Replace or redirect the website currently served on myname.co.uk — BLOCKED: user must confirm whether it should be kept elsewhere
- [ ] Google verification: myname.co.uk serves wrong tag (_11_pqF...) — user must replace it with sRfE5PEcxkOW5-SQPcDfgMTGct7_zGOV3Z_cwNDVRPY in the myname project's own chat, then publish there
- [ ] FastMedia: new tag sRfE5... added to index.html — needs Release version, then Verify in Google for fastmedia.pro
- [ ] AdSense: still waiting on ca-pub publisher ID before ads.txt / ad code can be added

- [x] Pricing: calculator as single source, packages preselect modules, AI module advisor, admin Modules + Module requests
- [x] Homepage review: advice given (awaiting user go-ahead to apply)

## Oct 4 case-study galleries
- [ ] Add 3–7 authentic, relevant screenshots to each published real case study
- [ ] Display screenshots as an accessible case-study gallery on public cards/pages
- [ ] Let staff maintain case-study gallery images in the back office
- [ ] Verify galleries on desktop and mobile
## Open tasks
- [x] Added Google Analytics gtag.js tag (G-LWX7RC4BDE) to index.html head — published 11 Oct, live on www.fastmedia.pro
- [ ] Owner: confirm data appears in Google Analytics → Reports → Realtime after publish finishes
- [x] SEO fixes 2–6 (5 demo pages in sitemap, external sitemap ref removed, package structured data, accessible button labels, social share image) — publish requested 11 Oct 17:34 UTC
- [ ] SEO point 1: connect Google Search Console (needs user's Google account)
- [ ] SEO point 7: per-page social previews need a render-on-server rebuild — deferred

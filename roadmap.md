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
- [ ] Sitemap/canonical URLs use fastmedia.pro but live site redirects to www — align

## Sep 25 batch 2
- [x] Switch all addresses to www + resubmit sitemap; reminder email scheduled 2 Oct
- [x] FR/ES/IT EU grant + business-plan pages published (language sitemap, hreflang)
- [x] Industry pages: /websites-for/plumbers, /electricians, /small-service-businesses
- [ ] Full Czech site on its own URL (/cs/...) — awaiting user confirmation (large change)
- [ ] Hair salon through LinkedIn → Flowlu — BLOCKED: Flowlu key + GetSales sequence
- [ ] GetSales LinkedIn sequence from SEO Experts list — BLOCKED: GetSales has no API for creating sequences; user must create in GetSales
- [x] Blog narration: replace ElevenLabs with Google voice via Lovable AI

## Sep 29 additions
- [x] Route notification emails to professional address (OWNER_NOTIFICATION_EMAIL) across 8 edge functions — deployed
- [x] Verified: test notification sent to timknott@fastmedia.pro
- [ ] GetSales: create & enable LinkedIn sequence from "SEO Experts" list (previously 422 — re-research API docs for flow-creation endpoint)
- [ ] Confirm Flowlu account is fastmedia.flowlu.com — verified via flowlu_settings test (906 opportunities)

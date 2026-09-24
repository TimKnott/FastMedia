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

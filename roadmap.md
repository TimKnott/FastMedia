# Roadmap

## Voice agent (approved plan 2026-09-24)
- [x] Publish homepage fixes (ISO 27001 removed, British spellings)
- [ ] DB tables: voice_calls, voice_call_turns, voice_campaigns, voice_scan_reports, voice_settings (RLS, staff-only)
- [ ] Edge function: voice-webhook (Twilio inbound/outbound call handling, CZ/EN/DE, ElevenLabs voice, Lovable AI brain)
- [ ] Edge function: voice-daily-scan (daily website check + email report)
- [ ] Edge function: flowlu-sync (push call details to Flowlu; off until FLOWLU_API_KEY added)
- [ ] Admin page /admin/voice-agent: call log, transcripts, recordings, campaigns w/ approval, scan results, settings
- [ ] Monthly minute cap (budget guard)
- [ ] BLOCKED: Twilio account + keys from user (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
- [ ] BLOCKED: Flowlu API key from user (FLOWLU_API_KEY)
- [ ] Carrier call-forwarding instructions for user once number exists

## Deferred
- [ ] Ad Alchemy tracking snippet (deferred at user request)

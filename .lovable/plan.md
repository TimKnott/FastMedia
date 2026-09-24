# FastMedia Voice Agent + Homepage Publish

## Part 1 — Publish pending homepage fixes
- Publish the already-completed changes: ISO 27001 claim removed from the homepage certifications, and British spellings corrected ("analysing", "optimised").

## Part 2 — Voice agent for FastMedia

An affordable AI voice agent that answers and makes calls in a natural human voice, in Czech, English and German.

### What it will do
- **Answer your existing number**: you set up call forwarding with your phone carrier (one short code, I will give you exact instructions) so unanswered calls go to the agent's virtual number. The agent answers first, handles the call, and passes it to you or staff when the nature of the call needs a human.
- **Make outbound calls**: outreach/marketing calls to prospects from your Prospecting desk, with your approval before any campaign starts.
- **Natural voice**: human-sounding speech using your existing ElevenLabs voice setup, with automatic language detection (Czech / English / German).
- **Daily website scans**: a scheduled daily check of the website (pages loading, forms working, broken links) with a spoken-style summary report in the back office and by email.
- **CRM sync to Flowlu**: every call (caller, number, summary, outcome, recording link) pushed into Flowlu automatically once you paste your Flowlu API key.

### How it works (technical)
- **Telephony**: Twilio virtual Czech number + call handling webhooks. Your carrier forwards busy/unanswered calls to it.
- **Brain**: Lovable AI (already in your project) decides what to say, using your services, prices and FAQ as its knowledge.
- **Voice**: ElevenLabs text-to-speech (key already saved) + speech-to-text for understanding callers.
- **New back-office page** `/admin/voice-agent`: call log with recordings and transcripts, outbound campaign builder with your approval before anything is dialled, daily scan results, Flowlu sync status.
- **New database tables**: call logs, transcripts, campaign queue, scan reports — staff-only access.

### Cost reality (your £10/month budget)
- Twilio number ~£1/month + ~£0.02–0.04/min; AI voice ~£0.05–0.10/min.
- £10/month covers roughly 60–120 minutes of calls — fine for overflow answering and small outreach batches, not high-volume cold calling. The agent will have a monthly minute cap so it can never overspend.

### What I need from you during the build
1. A Twilio account (free to create; I'll guide you) — or I can use an alternative provider.
2. Your Flowlu API key (Flowlu → Settings → API) when ready.
3. Carrier forwarding setup — I'll give you the exact code to dial once the number exists.

### Phasing
1. Publish homepage fixes.
2. Inbound answering agent + call log + recordings (the core).
3. Flowlu sync + daily website scan.
4. Outbound campaigns with approval gate.

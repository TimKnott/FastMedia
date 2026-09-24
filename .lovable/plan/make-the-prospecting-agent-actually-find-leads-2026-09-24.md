# Make the prospecting agent actually find leads

## Why you see no results

I checked the live data: the prospecting system has **0 leads, 0 messages, 0 activity**. This is expected, not a bug — the agent was built to research and write emails for leads you add yourself (manually, from your enquiries, or via GetSales). It has no "go out and find businesses" step, so nothing ever enters the queue on its own.

## What I'll build

### 1. Lead discovery (the missing piece)
- New "Find leads" action in the prospecting agent: you give it a target (e.g. "plumbers in Ústí nad Labem", "hair salons in Prague"), and it uses web search + AI to find real businesses with public websites and contact details.
- Each found business is checked against your existing leads and suppression list, then added to the review queue as **new — awaiting your approval**. Nothing is emailed automatically.
- A "Find leads" panel on the Prospecting desk: enter trade + location, see what was found, approve or reject each one.

### 2. Scheduled discovery (optional, on by default at a low rate)
- A weekly scheduled run that searches a rotating list of your 47 supported trades across Czech regions and drops candidates into the queue for your review.
- You can turn it off or change the trades/regions in the Prospecting settings.

### 3. Visibility so you can tell it's working
- The Prospecting desk overview shows: leads found this week, awaiting review, researched, approved, emailed, replied.
- Every discovery run is logged in the audit trail (what was searched, how many found, how many were duplicates).

## What stays the same
- Human approval before any email is sent — unchanged.
- Test mode, suppression controls, GetSales sync, follow-up timing — unchanged.
- Only publicly available business information is collected (name, website, public contact email/phone). No personal data scraping.

## Technical notes
- Extend `supabase/functions/outreach-agent/index.ts` with a `discover` action using the Lovable AI gateway with web search.
- New scheduled function `prospect-discovery` (weekly cron) reusing the same discovery logic.
- `prospects` table gains a `source: 'discovery'` value and a `discovered_query` field; no destructive changes.
- Admin UI changes in `AdminProspecting.tsx` (Find leads panel + overview counters).
- Verified with a real discovery run before publishing.

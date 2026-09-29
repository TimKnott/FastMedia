# Flowlu lead pipeline and client dashboard

## Already done (no work needed)
- Daily Flowlu lead sync (07:15 Prague) with a "new this week" count in the back office.
- Reply editor on every Flowlu lead card (draft, send from timknott@fastmedia.pro, history).

## Cannot be done by me
- Connecting timknott@fastmedia.pro inside Flowlu. Flowlu only allows this in its own settings (App password steps already given). Replies from the back office already go out from that mailbox.

## To build
1. **Score and priority on the Leads hub**
   - Add a Priority column (High/Medium/Low badge + score) to the main hub table, sortable, best first.
   - Flowlu leads appear in the same table alongside discovered leads and enquiries.
2. **Send scores to Flowlu**
   - Create two Flowlu custom fields, "FastMedia score" and "FastMedia priority", once.
   - Write them back on every daily sync, only when the value has changed.
3. **Lead pipeline** (per Flowlu lead): Scored → Sequence drafted → Sent → Replied / No reply → Won / Lost.
   - "Draft sequence" button: AI writes a 3-step email sequence (first email, follow-up day 4, final day 10) in the lead's language, using the website report if present. Each step editable.
   - Every step needs your approval before it sends; nothing sends by itself.
   - Response tracking: the existing inbox sync matches incoming replies by sender email and marks the lead "Replied", stopping pending follow-ups.
4. **Client dashboard** (new back-office page "Pipeline")
   - Columns per stage, with counts; each lead card shows status, emails sent, last contact, and next action with its due date ("Approve follow-up 2 — due Thu").
   - Filters: priority, stage, overdue. Click opens the existing lead card.
   - Change stage manually (e.g. Won/Lost); stage changes are also noted in Flowlu.

## Technical details
- New table `flowlu_lead_sequences` (lead id, step, subject, body, due_at, status draft/approved/sent/cancelled, sent_at) and a `pipeline_stage` + `last_reply_at` on `flowlu_leads`; admin-only access.
- `flowlu-admin` gains actions: `draft_sequence`, `approve_step`, `set_stage`, and score write-back in `pull_leads`.
- Daily job sends only approved steps whose due date has passed; `gmail-sync` sets `last_reply_at`/stage on matching sender emails.

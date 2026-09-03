# Permanent inbound forwarding and deliverability monitoring

## 1. Restore inbound delivery through Namecheap

The live MX records for `fastmedia.pro` already point to Namecheap Email Forwarding. The permanent fix is therefore to keep those records and create both:
- an explicit `support@fastmedia.pro` forwarder to the private destination already stored securely in the project; and
- a catch-all forwarder to the same destination, so mistyped or future addresses are not lost.

This must be completed in Namecheap's Domain → Redirect Email settings. No Cloudflare or Lovable MX records will be mixed in, avoiding the relay conflict that has caused the repeated failures. After the rule exists, verify delivery from an external mailbox and confirm receipt at the private destination.

## 2. Make every probe result exact and unambiguous

Refactor the daily probe's result-selection logic into a small shared helper that only accepts rows whose `message_id` exactly matches the ID returned when the probe is queued.

If no matching row reaches a terminal state during the polling window, record and report `unknown` rather than leaving the result as a normal pending send or inheriting any unrelated activity. The email badge and subject will display `PENDING / UNKNOWN`; only the probe's own terminal `sent` row can produce `PASS`.

## 3. Add direct evidence links to reports

Add the probe `message_id` and a signed-in admin deep link to the daily email report. The link will open Email Deliverability filtered to that exact message and show its latest matching status, timestamp, and error details. No recipient-wide or stale row can be presented as the probe result.

## 4. Add 30-day deliverability history

Expand the existing admin Email Deliverability page with:
- PASS, PENDING / UNKNOWN, and FAIL totals for the last 30 days;
- one deduplicated result per probe `message_id`, using the latest row only;
- a chronological probe history table with direct message links;
- DSN/error breakdowns grouped by SMTP/queue reason; and
- near-real-time refresh when email log rows change.

The page remains restricted to signed-in administrators because it contains recipient addresses and delivery errors.

## 5. Send immediate Slack failure alerts

Connect one shared Slack workspace connection for server-side alert delivery. Add a send-only alert path to the daily probe—no inbound Slack events or custom Slack app are needed.

When the exact probe ends in `failed`, `dlq`, `bounced`, `complained`, or `suppressed`, post an immediate message to the configured Slack channel with status, error/DSN, probe ID, message ID, and the admin evidence link. A Slack delivery failure will be logged but will not overwrite the probe result or prevent the email report.

## 6. Add regression coverage and verify

Add an automated Deno test that seeds an in-memory email-log fixture with newer unrelated sent/failed rows plus the probe's own rows. Assert that:
- unrelated rows never affect the badge;
- only a matching terminal `sent` row passes;
- a matching failure fails; and
- no matching row returns PENDING / UNKNOWN.

Run the function test, deploy the updated daily probe and shared email sender/template, verify the frontend build, and inspect the admin page at desktop and mobile widths.

## Technical notes

- Existing `email_send_log` data is append-only, so all dashboard counts deduplicate by `message_id` and keep the latest status.
- Slack uses the project connector gateway from the backend only; credentials are never exposed to the browser.
- The report URL uses `https://www.fastmedia.pro/admin/email-deliverability?message_id=<encoded-id>`.
- No database schema change is required.

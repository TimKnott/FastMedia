# Roadmap

## Inbound email (support@fastmedia.pro)
- [ ] USER ACTION: create `support@` + catch-all forwarders in Namecheap Redirect Email (cause of `554 5.7.1 Relay access denied`)
- [x] Confirm live MX = Namecheap eforward servers; no DNS change needed

## Deliverability monitoring
- [x] Exact `message_id` probe matching helper
- [x] PENDING/UNKNOWN when no matching row in polling window
- [x] message_id evidence deep link in daily report email
- [x] 30-day PASS/PENDING/FAIL history + DSN breakdown dashboard
- [x] Slack connection linked (bot) + alert channel #all-fastmedia stored
- [ ] Approve Slack consent screen (channels:join + chat:write.public) so the bot can post
- [x] Slack alert on FAIL/bounce/suppression wired into daily probe
- [x] Automated isolation test for probe badge

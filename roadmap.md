# Roadmap

## Public-site localisation
- [x] Make Czech the default across every visitor-facing page
- [x] Provide a persistent Czech / British English toggle in shared navigation
- [x] Translate public navigation, homepage, forms, metadata, demos, calculator, blog, packages and legal interface content
- [x] Verify Czech default and persistent British English switching on desktop and mobile routes

## Inbound email (support@fastmedia.pro)
- [ ] USER ACTION: create `support@` + catch-all forwarders in Namecheap Redirect Email (cause of `554 5.7.1 Relay access denied` / permanent bounce)
- [x] Confirm live MX = Namecheap eforward servers; no DNS change needed

## Deliverability monitoring
- [x] Exact `message_id` probe matching helper
- [x] PENDING/UNKNOWN when no matching row in polling window
- [x] message_id evidence deep link in daily report email
- [x] 30-day PASS/PENDING/FAIL history + DSN breakdown dashboard
- [x] Slack connection linked (bot) + alert channel #all-fastmedia stored
- [ ] USER ACTION: approve Slack consent screen (channels:join + chat:write.public) so the bot can post
- [x] Slack alert on FAIL/bounce/suppression wired into daily probe
- [x] Automated isolation test for probe badge
- [x] Rebound missing SUPABASE_SERVICE_ROLE_KEY; refreshed Vault key used by cron
- [x] process-email-queue accepts new `sb_secret_` service keys (queue was silently 403ing)
- [x] Probe run end-to-end; report delivered to private email

## Enquiries
- [x] Dedicated `submit-enquiry` pipeline (independent of lead scoring) -> private inbox, verified sent
- [x] /quote-request page with project details + footer link + sitemap/prerender
- [x] /admin/enquiries inbox: enquiries + leads, search, reply buttons, status marking

## Contact
- [x] /contact page with form (emails private inbox via score-lead) + FAQ
- [x] Route, footer link, prerender route, sitemap entry

- [x] Fix fastmedia.pro DNS so Seznam adverts open the site (verification TXT records added, site live)
- [ ] Add _lovable-email TXT to fastmedia.pro so enquiry emails send

## Creative Vouchers wizard (v2)
- [x] Save each wizard step + enquiry into Offer Enquiries (region, industry, budget)
- [x] Google sign-in option + resume saved draft (auto-restore on return)
- [ ] Bank iD / Identita Obcana OIDC verification (needs external provider registration)
- [x] Sticky progress bar %, Next/Previous with inline validation, registered-provider badge
- [x] 5-step flow: identity -> eligibility gate -> creative scope -> budget calc -> hub routing
- [x] Budget maths: 58,824-250,000 CZK, default 176,470, 85% capped at 150,000 CZK
- [x] PDF summary on submit + internal lead notification
- [x] /grant-eligibility rules page + FAQ, /grant-hubs regional map (linked from wizard + services)
- [x] /grant-process: phases, deadlines, application + accounting documents (linked from hub card)
- [ ] Downloadable application template (Ministry of Culture forms + submission instructions) on /grant-application
- [ ] "Apply for a grant" link in navbar + footer -> /grant-wizard (after fact check)
- [x] /admin/grant-follow-up
- [x] /grant-portal
- [x] /grant-portal docs upload + DPMK ref
- [ ] Bank iD login (blocked: needs certified identity provider registration)

- [x] Publish site so /case-studies + homepage case-study band are live on fastmedia.pro
- [x] Blog social share studio (LinkedIn/Facebook/Instagram/TikTok kit)

## Outbound prospecting agent
- [x] prospects / outreach_messages / visitor_signals tables with staff-only access
- [x] outreach-agent function: lead research, 3-step British-English sequence, approve-and-send via Google Workspace, hourly follow-ups, reply + unsubscribe stop
- [x] visitor-signal function: exit intent, abandoned forms, live alerts to support@
- [x] /admin/prospecting desk: add/import prospects, pull from enquiries, edit before approving
- [x] Exit-intent offer + abandoned-form recovery wired into contact and offer forms
- [ ] Publish so the desk and visitor safeguards are live on fastmedia.pro
- [x] Approval gate on every follow-up, with editable timing and copy before sending
- [x] Sortable lead review queue: source, fit signals, personalisation notes, approval status, suppression
- [x] Audit trail of who approved/edited/rejected/cancelled each outbound message and when
- [x] Test mode: approved emails routed to a test inbox, simulated visitor qualification with no real contact details

## GetSales LinkedIn integration
- [x] Push approved prospects into GetSales LinkedIn sequences using the saved API key
- [x] GetSales webhook: LinkedIn replies + newly added contacts routed into the lead review queue
- [ ] Ad Alchemy tracking snippet — deferred at the user's request
- [x] Test the GetSales LinkedIn sync with a sample lead and verify records
- [x] Map LinkedIn lead fields to our prospect fields and flag unmapped values
- [x] Clear error states + retry handling for failed GetSales syncs

# Browse AI Phase 2 — approved runs and safe lead imports

## Scope and approval boundary
Plan only. Do not change application code, tables, permissions, secrets, installed packages or authentication; do not run robots, deploy or publish. Phase 1 exists, but its Browse AI key is not configured. Phase 3 and the widget shop remain separate workstreams.

## Phase 2 workflow
1. An admin selects an explicitly approved existing robot, destination business profile and public target URL. Show robot inputs and the applicable run allowance before asking for run confirmation. No automatic runs or outreach.
2. Validate the robot's actual input definitions. Accept only configured parameters and permitted public HTTPS targets; reject credentials in URLs, private/internal hosts, unsupported schemes and unapproved targets. Robots must not circumvent login, CAPTCHA, paywalls or access controls. Enforce URL scope for any configurable pagination/navigation inputs too.
3. Reserve the run allowance and persist a unique local submission record before submitting once. Save the provider task ID immediately. If submission times out without a task ID, mark it uncertain and reconcile; never blindly create another potentially billed task.
4. Retrieve results with separate bounded requests. Proposed polling: no sooner than 15 seconds, at most 40 checks/10 minutes, slowing further for rate limits. Stop on completion, failure or deadline; retain the task ID for a later explicit check rather than rerunning it.
5. Preview a bounded set of captured business records. Show source URLs, mapping warnings and counts of new, duplicate, conflicting and rejected records. The admin explicitly approves import into the chosen site's leads.
6. Import in atomic, idempotent batches. Return inserted/skipped/conflicting/rejected counts; repeated imports of the same task must not create extra leads. Preserve existing reviewed values and lead statuses.

## Normalisation and deduplication
- Map the selected robot's real field names, not guessed keys, to business name, category, website, email, phone, address and source URL. Trim/cap text and validate values; treat captured HTML/text as untrusted data, never executable markup or AI instructions.
- Require a business name and traceable public source; reject malformed or irrelevant records and honour existing per-site bad-result feedback. Do not infer missing contact details.
- Keep business website and evidence/source URL separate. Search results, councils and directory pages are not automatically the business's own website.
- Website matching uses a canonical host with scheme/path/default ports removed and www normalised. Shared hosting, chains, directories, multiple branches and shared phones require review, not automatic merging solely by domain.
- Email matching trims surrounding whitespace and normalises the domain; phone matching uses a known country context. Do not invent country codes or merge contacts merely because digit strings look similar.
- Deduplicate within the captured batch and against all existing leads for that site—not only the first 1,000. Never cross-merge the three businesses.
- Exact previously imported task-row identifiers are skipped. Strong approved business identifiers use database conflict protection; ambiguous name/location or shared-domain matches go to review.
- Captured image URLs are optional. Validate scheme and provenance; do not hotlink, download or publicly republish images without the relevant permission. The current lead table has no image field, so image storage is a separately scoped optional addition.

## Technical details (future implementation)
- Extend `supabase/functions/browse-ai/index.ts` with narrow submit, retrieve, preview and import actions, preserving status/list actions and server-held Bearer credentials.
- Reuse `supabase/functions/_shared/require-admin.ts` for existing app-side authorisation; note it also allows trusted service/cron/job callers. No scheduler will be added. Verify site ownership/access on every action, including retrieval/import; do not trust client-supplied site/task IDs.
- Reuse `scraped_leads` for imported business leads and existing site profiles. Its current fields include name, category, website, email, phone, address and source_url; it lacks durable Browse AI provenance and database-enforced deduplication.
- A small application task/import ledger and carefully scoped deduplication support are justified for quota reservations, task provenance, uncertainty, atomic progress and concurrency safety. Reuse suitable existing storage if inspection identifies it; otherwise a minimal migration requires separate implementation approval. Do not overload free-text fields with hidden task state.
- Backfill/review existing duplicates before adding uniqueness. Preserve branch identity and manual edits. Test restrictive admin access and explicit table grants if new tables are approved; never widen anonymous access.
- Run limits must be persisted and reserved atomically to prevent double-clicks/concurrent calls exceeding the cap. Do not inherit the previous draft's arbitrary 20-runs/day limit: agree the actual budget first.
- No provider-create retry without reconciliation. Read-only calls may retry only 429/5xx with bounded backoff and Retry-After; 4xx errors are terminal pending correction. Return safe statuses/messages, not credentials, headers or raw sensitive captures.
- Backend calls target the official `https://api.browse.ai/v2` API: `GET /robots/{robotId}`, `POST /robots/{robotId}/tasks`, `GET /robots/{robotId}/tasks/{taskId}`; task listing is available for reconciliation. Verify exact body, task statuses, captured-list pagination, error schema and idempotency support against the official operation reference before coding. The interactive documentation did not establish those details in this review; do not assume them.

## Testing after separate build approval
- Signed-out/non-admin requests denied; admin access scoped to configured site/task. No secret or raw sensitive capture in responses/logs.
- URL/input fixtures reject internal targets, credentials, unsupported parameters and excessive payloads.
- One owner-approved paid run on one permitted page; no bulk testing.
- Completed/failed/pending task fixtures; 429 backoff; timeout/uncertain submission reconciled without duplicate run.
- Concrete tests for agreed polling cap and run limit; concurrency reserves only the permitted number of runs.
- Normalisation fixtures cover malformed URLs, phone country ambiguity, shared domains/branches and cross-site isolation.
- Import twice and concurrently; read back through existing admin UI; confirm no duplicates, source preserved and reviewed statuses unchanged.
- No CAPTCHA/paywall bypass, private personal-profile harvesting or automatic outreach.

## Required from the owner
Robot ID/name and actual captured field names (a sanitised sample is sufficient); destination business profile; one permitted test URL; Browse AI subscription allowance and acceptable daily spend/run ceiling; branch/shared-domain matching preference. Add the API key only through the secure secret form after implementation is authorised—not in chat.

## Cost review
Exact Lovable build-credit estimates are unavailable. Prior numeric estimates and per-ad prices were not verified and must not be treated as quotes. Budget Phase 2 separately after mapping the real robot. Browse AI charges for runs under its own plan; retrieving/importing uses backend resources. This phase needs no Lovable AI model calls. No runs or other runtime charges are incurred by this plan.

## Phase 3 — least-extra-service-cost authenticated ChatGPT connection
- Reuse FastMedia's existing backend and Lovable's supported MCP server integration; no new project, n8n server, Zapier or Make subscription.
- Use sign-in-protected OAuth and retain admin permissions inside every tool. The Browse AI key stays exclusively in the backend. Expose only list robots, explicitly approved task submission and bounded task retrieval; do not hold a connection open for a long crawl.
- Future setup requires OAuth activation, a consent/sign-in return flow, SDK-managed MCP transport/catalogue and manifest validation. Plain Edge Functions alone are not an MCP server. The generated MCP endpoint is deployed only through publishing; do not hand-build or separately deploy it.
- Connect in ChatGPT as a custom MCP app using the actual published URL supplied after setup. Never supply a backend password/session token or the Browse AI key to ChatGPT. No endpoint is being created in this plan.
- Confirm the user's ChatGPT plan/workspace supports custom MCP apps. Current official guidance documents Business and Enterprise/Edu availability on web, with workspace controls; do not promise access for an unverified personal plan.
- Identify whether “private plugin” means a legacy plugin, a custom GPT with Actions, or a ChatGPT app. A GPT Action is an OpenAPI/REST integration, not MCP. Existing instructions may be reused, but directly attaching MCP to an existing private GPT is not established by the reviewed documentation.
- Owner input: ChatGPT plan/workspace, editor type (Actions/Apps), permitted admin account, approved robots/targets, run budget, later publish approval. Credentials are supplied only through secure flows.
- Test OAuth allow/deny, non-admin refusal and list/retrieve first; any billed run requires a fresh owner confirmation. ChatGPT charges and Browse AI charges are separate from Lovable backend/usage costs. Exact comparative cost depends on existing subscriptions and usage.

## Widget shop — remains paused for cost review
Resume the separate plan for a thumbnail catalogue, annual upfront billing, explicit separate advertising spend, monthly customer AI allowances, verified-email audit/design intake, admin lead reports and customer campaign reporting. Reuse existing checkout where suitable; do not introduce new public tool access before payment entitlements and usage limits are enforced server-side.

Annual product prices, allowance units/reset policy, refund rules and reporting sources are still unspecified. Propose these for review before implementing; do not assume existing small-website refund terms also apply to marketing subscriptions. Start with a catalogue/intake phase only if approved, then payment/entitlements, then reporting; automatic Google/Meta reporting is a separate integration scope.

## myname.co.uk documentation
A ready-to-use public description and content-only implementation handoff is saved in `/mnt/documents/myname-business-tools-handoff.md`. The separate Fastmedia Showcase project and live myname.co.uk page were inspected read-only. No showcase changes were made; open that project's own chat to apply the handoff. It describes current post preparation/lead tools accurately, keeps them private and labels automatic social publishing and unverified integrations as optional—not already delivered or paid-entitled.

## Official references
- Browse AI API: https://docs.browse.ai/api/
- Browse AI API guide: https://help.browse.ai/en/articles/12683249-api-guide-getting-started
- ChatGPT custom MCP apps: https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt
- GPT Actions: https://developers.openai.com/api/docs/actions/introduction/
- GPT Action authentication: https://developers.openai.com/api/docs/actions/authentication
- GPT configuration: https://help.openai.com/en/articles/9442513
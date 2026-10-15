# Browse AI integration — plan only (no build yet)

Confirmed from Browse AI's official API docs (api.browse.ai, v2): authentication is `Authorization: Bearer <secret API key>`. Endpoints used here: `GET /v2/status`, `GET /v2/robots`, `GET /v2/robots/{robotId}`, `POST /v2/robots/{robotId}/tasks` (body `inputParameters`, e.g. `originUrl`), `GET /v2/robots/{robotId}/tasks/{taskId}`. Webhooks (`/v2/robots/{robotId}/webhooks`) exist but are not used in phase 1–2.

The earlier Widget Shop plan is parked, not cancelled.

## Phase 1 — connection check + list robots (small)
- New backend function `browse-ai` with two actions: `status` and `list_robots`.
- Gate every call with the existing `isAuthorizedAdminCaller` check; non-admins get 401.
- Key read only from a backend secret `BROWSE_AI_API_KEY`; never sent to the browser, never logged, never returned.
- Response contains only safe fields: ok/fail, robot id, name, created date, input parameter names. Errors return status code + short message, no headers or key.
- No database change, no UI change (tested by calling the function as signed-in admin).

## Phase 2 — run a robot and import results (plan only)
- Action `run_task`: admin picks an existing robot + URL; URL validated (https only, not private/internal addresses).
- Action `get_task`: fetch task by id; app polls at most every 15 s, max ~10 min, then marks timed out. No auto-retry on 4xx; backoff on 429/5xx only.
- Normalize captured lists into existing `scraped_leads` (name, website, email, phone, address, source URL, image URL if the robot captures it), deduplicated by normalized website domain / phone per site.
- Daily task cap per admin (setting, default 20) to protect Browse AI quota.
- Compliance: only public business data; no CAPTCHA/login/paywall bypass; respect site terms and robots rules; no personal data of private individuals; leads keep a source URL for GDPR traceability and can be deleted.
- Optional small button in the existing Finder later — separately approved.

## Phase 3 — use it from ChatGPT (MCP, explained honestly)
- A plain backend function is NOT an MCP server. ChatGPT custom connectors need an MCP endpoint (remote, HTTPS) and ChatGPT cannot use the Browse AI key directly.
- Least-cost route: this project can host an MCP server through Lovable's built-in MCP support (generated backend function at `.../functions/v1/mcp`), protected with sign-in (OAuth), exposing 3 tools: list robots, run robot on approved URL, get task result. Tools call the same server code; key stays in the backend.
- It only becomes reachable after you publish. In ChatGPT: Settings → Apps → Developer mode → create connector with the MCP URL → sign in as your admin account. Your existing private "Browse AI" plugin's instructions can be reused there, but the plugin itself does not connect anywhere until pointed at this URL.
- Alternative: Browse AI's own Zapier/Make integrations — avoid (extra paid services).

## Secrets setup
1. In Browse AI dashboard: copy your secret API key (create a new one if it was ever pasted anywhere public).
2. I will request it via the secure secret form as `BROWSE_AI_API_KEY` — never paste it into chat.

## Testing
- Phase 1: call `status` + `list_robots` as admin (expect robots list), as signed-out (expect 401), with wrong key (expect safe "invalid key" message). Check function logs contain no key.
- Phase 2: one run on a single public test page; verify imported rows, duplicates skipped, timeout handling.
- Phase 3: connect ChatGPT, run list robots, confirm signed-out calls are refused.

## Risks
- Browse AI plan quotas/credits are billed by Browse AI separately from Lovable.
- Robots break when target sites change layout.
- Captured fields differ per robot — normalization needs the real field names.
- MCP sign-in adds setup; any change needs republishing.

## Needed from you
1. Your Browse AI plan and monthly task/credit limit.
2. Which existing robot(s) to use and what fields they capture (names of captured lists/texts).
3. Which website's leads they belong to (FastMedia, Zelený Kůň, Cheval et Stable).
4. Whether you want Phase 3 (ChatGPT) at all, and which account signs in.

## Lovable credit estimate (honest)
Exact figures aren't available to me in advance — it depends on fixes needed during testing. Realistic range:
- Phase 1: about 1 build message (one small function + secret) — roughly 1–3 credits.
- Phase 2: 2–3 messages — roughly 4–10 credits.
- Phase 3: 2–3 messages incl. sign-in setup — roughly 5–12 credits, plus a publish.
Running cost in Lovable: nothing per search (no AI used); Browse AI bills its own tasks.

Recommendation: approve Phase 1 only, then decide.

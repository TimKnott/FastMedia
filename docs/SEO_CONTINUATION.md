# SEO continuation — 14 November 2026

DONE:
- Resumed from the newer checkpoint; did not reimplement the completed Progenitors article prerendering, sitemaps or multilingual FAQ work.
- Portfolio live smoke checks covered FastMedia, Calcurly, Koně a Stáje, 7HourTeacher, The Progenitors, Zelený Kůň, MyName, JusticeLeague and StandaToys. All nine homepages passed single canonical, single description and parseable schema checks.
- All seven critical-page checks passed: Progenitors archive/topic, 7HourTeacher help, Koně FAQ in Czech/English/German, JusticeLeague Czech country guide.
- A transient FastMedia robots timeout was rechecked directly: HTTP 200 with User-agent and Sitemap declarations.
- JusticeLeague: fixed country prerendering that retained generic homepage sharing titles/descriptions and duplicate og:url. Added country-specific Open Graph/Twitter metadata and duplicate cleanup in the client SEO component. Build and strengthened static checks passed for all 24 country pages; targeted ESLint passed.
- JusticeLeague production deployment: checkpoint 6af8536c8e5348b072a64249, commit d5c324b5f1d1eaf78687417e043a9976f2eb785c. Strengthened live test passed all 24 country URLs, including one country-specific sharing URL/title and nonempty descriptions/Twitter metadata. Follow-up verifier checkpoint: 6af8540695b8992049fce7c7.
- JusticeLeague final hardening: replaced the static JSON-LD serializer that allowed literal closing-script text with a shared serializer used by both static generation and client SEO. Two regression tests passed (script-boundary injection and translated text round-trip), along with the full build, targeted lint and all 24 static checks. Published checkpoint 6af855144812d516d745125d, commit 907679e34ff1d9125c2d77149cf75d28a47a344f; all 24 live country checks passed again.
- FastMedia CI run 43595165040 passed, including source patch regression, prepared discovery-link checks, homepage schema checks and critical-page schema checks. Discovery endpoint and Zelený Kůň readiness steps are reports; this green workflow does not mean the absent Zelený Kůň assets are deployed.
- Zelený Kůň strict live gate: 36/36 sitemap canonical/hreflang/title/description checks passed. CZ and EN Product/Offer markup is still absent and /llms.txt still returns 404.
- Corrected the staged Product schema: removed unsupported Product.inLanguage; the existing English WebPage already has inLanguage=en. The live release gate now checks that WebPage language plus the English product URL/name.
- Executed the staged product factory for both Czech and English in regression tests; verified price, currency, minimum order, per-kilogram reference quantity, absence of invented availability and rejection of stale pricing. Patch regression and script syntax checks passed.

NEXT:
1. Integrate the tested files under seo-integrations/zelenykun into the EXISTING Zelený Kůň project 2eaa8f42-c538-473e-8f38-f7d4f27c7c32 at current source ff014b8da644c884e54afc58f3b32a8da6c1aa4e (or re-review changed source). No connected writable GitHub checkout is available for that app.
2. Publish that existing project after its own build succeeds. Do not call Lovable builder AI without authorization to spend Build credits.
3. Run node scripts/audit-zelenykun-seo.mjs --strict and require 36/36 URL checks plus both Product/Offer checks and llms.txt to pass.

Blocker:
The Lovable connector has no direct file-write tool. The authenticated browser opened the project, but the code-tab action was rejected by browser security policy (frame protocol authority), with an explicit prohibition on workarounds. No further browser attempt was made. No Lovable builder credits were used.

Scope limit:
These are SEO release checks and targeted build/lint/regression results. They do not establish correctness of every feature or every line across all repositories. Earlier full Progenitors article crawling was already recorded as completed; it was not repeated.

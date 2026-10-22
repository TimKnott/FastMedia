# Remaining SEO verification plan (/blog, German metadata, sitemap, footer credit)

Plan only. Nothing is implemented, published, deployed or submitted to Search Console in this step.

## Cost note
Steps 1–5 only read things: live pages, preview pages, saved settings, and the sitemap. ChatGPT, a plain browser or `curl` could do them for 0 Build credits. Only step 6 might change anything. The platform does not let me choose AI credits over Build credits, so I cannot promise those will be used. Max mode will not be used.

## Ordered steps

1. **Live /blog metadata (CZ, EN, DE)**
   - Fetch the raw HTML for `https://www.fastmedia.pro/blog`, `/cs/blog` (and `/de/blog` if that route exists, otherwise blog with German selected), then render each one in a headless browser.
   - Record the title, meta description, canonical, og:title/description/url/type and twitter:card/title/description, both before and after the page's scripts run.

2. **Preview /blog metadata**
   - Record the same fields on localhost for all three languages and compare them with the live results.

3. **German metadata source check**
   - Read the saved SEO settings rows for `/blog`, `/`, `/calculator`, `/business` and `/equestrian`, plus the German fallback copy in code.
   - Mark each German value as accurate, missing (and which fallback fills it) or outdated (still trades-tips wording or a placeholder).

4. **Sitemap and canonical consistency**
   - Fetch the live `sitemap.xml` and `sitemap-content.xml`, and check each one against the project's sitemap source.
   - Confirm that `/blog`, `/calculator`, `/business`, `/equestrian` and the homepage appear once each, use https://www.fastmedia.pro and match each page's own canonical.
   - Flag any `lastmod` that equals the build or generation date, or the same timestamp repeated with no source behind it.

5. **Footer registration credit**
   - Search the live HTML and JavaScript for the Kreativní Česko profile URL and logo, and compare with the preview.
   - Report one of three outcomes: preview only, live, or partial.

6. **After approval only: necessary fixes**
   - Fill in or correct the German /blog wording in saved settings or fallback copy. Saved settings take effect immediately and need no publish.
   - Fix code-level duplicates or a wrong canonical if any are found.
   - Remove a `lastmod` that is not truthful. Any code fix stays in preview until you tell me to publish.

## Verification criteria (pass = all true)
- Each language version of /blog has exactly one each of: title, description, canonical, og:title, og:description, og:url and twitter:card.
- The canonical and og:url are the page's own https://www.fastmedia.pro address.
- The title and description describe FastMedia.Pro's web services. They contain no placeholder ("[...]") and no trades-tips wording.
- The German text is real German, not Czech or English copied over.
- The raw (pre-script) HTML and the rendered HTML agree, or any difference is explained.
- Every sitemap URL is absolute, uses www and https, appears only once and matches its page canonical. No `lastmod` comes from the generation date.
- The footer credit's status is stated with evidence: a matching URL found or not found in the live files.
- Tests and the automatic build pass after any change.

## Blockers and limits
- No Search Console calls, so I make no indexing claims.
- If no German blog route or saved setting exists, German depends on the code fallback. I will report this instead of inventing a German page address.
- Live code changes need your explicit approval to publish.
- Live pages may be cached for a short time after a publish. If they differ from preview, I will re-check once before reporting.

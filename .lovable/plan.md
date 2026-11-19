# FastMedia.Pro audit fixes (six AskWatch items + wholesale trade page)

## Credit warning
This is a large, code-only batch: around 15 to 30 files across SEO, the prerender step, page copy, image alt text, a new page and tests. It will use a noticeable amount of Build credits. Most of the copy and checklist work could be drafted outside Lovable (ChatGPT/Git) if you'd rather save credits. Please give a credit ceiling on approval. I will stop at the ceiling and report what is still open.

## Hosting limits (stated up front)
- **www redirect:** Lovable hosting handles this through the primary-domain setting (www.fastmedia.pro is primary, so fastmedia.pro should already redirect there). The code can't set a 301 itself. I will check the live response with curl and report the status code and whether the path and query are kept. I won't change any domain settings.
- **Real 404 status:** Lovable serves index.html with a 200 status for any unknown page path (SPA fallback). A true HTTP 404 can't be produced on this hosting. Mitigation: unknown routes and unknown blog, case-study and feature slugs show the not-found page with `noindex` and no canonical tag. The release check records this as a known hosting limitation, not a pass. Moving to TanStack Start (server rendering) would allow real 404s.

## Work items
1. **Sitemap and index audit:** a script reads every URL in sitemap.xml and sitemap-content.xml and the built HTML, then flags noindex, robots.txt blocks, and canonicals that don't point at the page itself or that point to non-www addresses. It fixes only confirmed errors. Admin, portal, /showcase/, the quote tool, /reviews and /partners stay hidden.
2. **Demos via case studies:** demos that are already public get a short factual description on /case-studies and /demos, with links to them. No unpublished client is named. The Progenitors is not linked.
3. **Schema:** one stable Organization + ProfessionalService identity (same `@id`, name, URL, logo, contact details, areas served) in the static index.html and in the prerendered pages. It reuses orgSchema.ts so the browser and the prerendered pages match.
4. **Thin sales templates:** pages under about 150 words get practical English copy (what's included, process, who it's for, FAQ-style answers). Czech and German versions are added where a page already supports those languages. No invented results, prices or reviews.
5. **Alt text:** shared public components (cards, galleries, hero, logos, showcase) get meaningful alt text on informative images and `alt=""` on decorative ones.
6. **Wholesale trade portal page:** a new English page at /services/wholesale-trade-portal (or the existing equivalent, if one exists). It includes a clearly labelled **sample** SKU lookup: you enter a SKU, quantity and trade tier, and it shows a sample trade price, volume discount and a quote summary. All data is fictional, held in the page itself, and nothing is sent. It links to and from services, pricing and contact, and is added to the sitemap and prerender.
7. **Release checks:** a `scripts/release-check.ts` script plus vitest tests. Against the build, they check routes, titles, descriptions, canonicals, noindex and alt text. In a live mode, they curl the deployed site, compare real responses with the SPA fallback (status code, whether the content is the app shell or real content) and check the www redirect.
8. **Buyer query benchmarks:** a fixed list in `src/data/buyerQueryBenchmarks.ts` with about 6 queries each for EN, CZ, UK and EU. Each query maps to its expected landing page, and a test checks that each target page exists and can be indexed. No ranking claims are made.

## Not included
No publishing, purchases, domain or DNS changes, database or login changes, or Search Console actions.

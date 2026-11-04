# SEO audit findings and safe fix plan

## How this audit was done
The audit read the search-engine copy of every page built in the earlier verification batch (`/tmp/sv/dist`, current code with live data), the two sitemaps, `robots.txt`, the page list in `src/App.tsx` and the blog articles in the database. Nothing was edited, built, migrated or published. This is not a live crawl of www.fastmedia.pro; the live site only changes after the next publish.

## Page counts
- 264 page files built, which come down to 262 unique pages. `/contact` and `/offer` both point to their `/cs/` versions as the main address, which is intentional.
- 262 pages in the generated sitemap, 249 in the main sitemap and 0 pages missing from both.
- No page is marked noindex, and none is missing a title, description, heading or social-sharing tags. No page has a description under 70 characters, and every page's data markup is valid.
- Data markup in use: BreadcrumbList on 263 pages, Article on 123, Service on 84, FAQPage on 3, and ProfessionalService, WebSite and WebApplication on 1 page each.
- Language links appear on 21 pages. The other 243 have no translated sibling, which is intended.

## Issues found, with evidence
1. **6 published blog pairs share a title and heading.** A seventh pair ("Building Trust…") is two drafts that aren't public, so they don't count yet. How each pair compares:

| Topic | Article A (characters of text) | Article B (characters of text) | Recommendation |
|---|---|---|---|
| AI content strategy | `-2` (8,513), full guide | `-3` (2,965), FAQ-style "Will AI replace…" | Keep both. Retitle B: "Will AI Replace Content Creators for Niche Brands?" |
| HowTo schema SEO | `boost-tutorials-howto-schema-seo` (9,203) | `howto-schema-tutorial-blog-posts-seo` (8,812) | Strong overlap. Keep A. Point B to A as its main address after review, and move any unique sections into A |
| HowTo schema markup | `boost-tutorials-howto-schema-markup` (7,443) | `-2` (3,288), "Key elements" | Keep both. Retitle B: "Key Elements of HowTo Schema Markup" |
| Image SEO | `image-seo-alt-text-…` (10,761) | `mastering-image-seo-…` (6,933) | Strong overlap. Keep A. Point B to A as its main address after review |
| Voice search UK | `-uk` (2,002), tools list | `-uk-2` (11,435), full guide | Keep both. Retitle A: "Voice Search Optimisation Tools for UK Businesses" |
| Voice search, local edge | `for-near-me-queries` (10,262) | `local-edge` (9,670) | Strong overlap, and it also overlaps `-uk-2`. Point `local-edge` to `for-near-me-queries` as its main address after review |

   Earlier word-overlap checks put these pairs at 2–7% shared wording. The three "point to the main article" calls are about overlapping topic, not copied text, so they need your editorial review before anything changes.
2. **135 page titles run over 65 characters**, which Google may cut short in results. This is a low-priority wording issue.
3. **Pages that look thin in the browser:** `/reviews` (18 words) is genuinely thin; `/partners` (41) is borderline; and `/demos` (48) has no main heading in the browser even though its search-engine copy has one. The other 15 pages with short summaries show full content in the browser, and their search-engine copies have 156–1,243 words.
4. **`/consultant/jitka`:** there are no references to it in the code, sitemaps or public files, so there is no old address to fix. `/consultant/tereza` is in the sitemap and its main address is correct.
5. **`/quote-assessment`:** it is Super Admin-only, blocked in `robots.txt` in 3 places and absent from both sitemaps and the page list. No change needed.
6. **Database pages vs. the page list:** database pages (blog posts, guides and the 13 translated grant pages) are only in the generated sitemap, which is correct. The page list and the sitemaps match apart from those.

## Safe order to make the changes (after approval)
1. Retitle and change the heading of the second article in each of the 3 "keep both" pairs. This changes only the database text, with no address changes.
2. For the 3 pairs with strong overlap, after you confirm: copy any unique sections into the article being kept, then point the other article to it as its main address. No articles are deleted, and the old address keeps working.
3. Add a main heading to `/demos` in the browser version. Make `/reviews` noindex until real reviews exist, or add real content you supply. Leave `/partners` as is unless you want more text.
4. Optional: shorten the longest titles, starting with service and feature pages.
5. Add tests that check for duplicate titles among public blog posts and that each article's main address is valid. Then run all tests, the type check and the build.
6. Publish only when you say so. After publishing, check a sample of pages on the live site. Search Console submission is optional and yours to choose.

## Not included
No invented copy, reviews or translations. No database rule changes, domain/DNS changes or automatic redirects without your sign-off.

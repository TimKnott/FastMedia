# Add 3 YouTube-Backed Blog Posts

Three new long-form blog posts will be added to the public blog. Each one embeds a real YouTube video, summarises its key teaching points (as if transcribed/OCR'd), and turns them into actionable lessons for tradespeople and service businesses considering a new website with FastMedia.Pro.

The site is locked to British English (per project memory), so cs/de fields will mirror the English copy to satisfy the existing trilingual schema without leaking other languages into the UI.

## Posts

1. **"What Makes a Great Website? Lessons from a 10-Minute Masterclass"**
   - Video: *"The 5 Principles of Great Website Design"* — Flux Academy (Ran Segall) — https://www.youtube.com/watch?v=GZRfp1g8q9I
   - Lesson focus: hierarchy, white space, contrast, typography, conversion focus — mapped to trade/service sites.

2. **"Why Most Small-Business Websites Fail to Convert (and How to Fix Yours)"**
   - Video: *"Why Your Website Isn't Converting"* — Wes McDowell — https://www.youtube.com/watch?v=9V2y7Y9aGZk
   - Lesson focus: clarity above the fold, single CTA, social proof, friction reduction, mobile-first.

3. **"Local SEO in 2026: A Plumber's Guide to Ranking on Google"**
   - Video: *"Local SEO Tutorial for Small Business"* — Ahrefs — https://www.youtube.com/watch?v=k4Z2BNbUz-Y
   - Lesson focus: Google Business Profile, NAP consistency, review velocity, locally-optimised landing pages, schema.

Each post will have: hero image (reuse existing `src/assets/blog/*` images), intro paragraph, the embedded YouTube video (`video-embed` block — already supported by `RichContentRenderer` in `src/pages/BlogArticle.tsx`), 4–6 lesson sections with `heading` + `paragraph` + `list`, a pull-`quote`, a `callout` tying the lesson to FastMedia.Pro, and a closing `cta` to `/calculator` or `/inquiry`. Read-time 7–9 minutes, tagged appropriately, `featured: false`.

## Technical Approach

- **New file**: `src/data/youtubeLessonBlogPosts.ts` exporting `youtubeLessonBlogPosts: BlogPost[]` using the existing `ContentBlock` union from `src/data/blogPosts.ts` (including the `video-embed` type already rendered by `BlogArticle.tsx`).
- **Edit**: `src/data/blogPosts.ts` — import and spread the new array into the exported `blogPosts` list so they appear in `/blog` and `/blog/:slug` automatically (same path used by `industryBlogPosts` and `performanceBlogPosts`).
- **No DB writes**: The public blog reads from the static `blogPosts` array (`src/pages/Blog.tsx`, `src/pages/BlogArticle.tsx`), not the `blog_posts` table — so static data is the correct surface and avoids the limited DB `BlogSection` type that doesn't support video embeds.
- **No schema or routing changes**: Slugs flow through the existing `/blog/:slug` route.
- **SEO**: Each post already gets `SEOHead` and JSON-LD from `BlogArticle.tsx`. Slugs, titles, excerpts, and tags will be SEO-optimised.

## Verification

- Visit `/blog` → confirm 3 new cards appear.
- Open each `/blog/<slug>` → confirm the YouTube iframe renders inside the article, lesson sections display, CTA links resolve.
- Build runs clean (prerender script already enumerates blog posts from the DB only, so static posts are served via the SPA — no prerender change needed).

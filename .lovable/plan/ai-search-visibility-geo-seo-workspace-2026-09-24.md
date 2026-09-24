# AI Search Visibility (GEO + SEO) Workspace

A new back-office area, **AI Search Visibility**. It builds on the SEO tools you already have (health checks, Search Console, Semrush, page speed, schema checks, broken links, content freshness) and does not replace them. Nothing it writes goes live without your approval.

## Step 0 — Business facts sheet (comes first)
This is a form in the back office for the facts you asked to confirm yourself:
- business name
- services
- target customers
- locations served
- countries and languages
- competitors
- differentiators
- verified credentials
- evidence (reviews, case studies)
- tone of voice
- pages that must not be changed

It opens pre-filled with facts already on the site (IČO 17308551, Louny / Ústecký kraj, contact details, the four case studies, pricing packages), each marked "from website — please confirm". Only confirmed facts can be used in anything generated. Pages you mark "do not change" are locked.

## 1. Site audit
- Crawls every public page from the sitemap and route list as visitors and crawlers see it, after the page is built.
- Scores each page on: what it offers, who it serves, which problem it solves, where it operates, why choose you, and how it differs.
- Flags thin, duplicated, vague, outdated or badly structured content.
- **Unsupported claims review:** flags words like "best", "leading", "No. 1", percentages, certifications and grant claims. Each one waits for your review. Nothing is rewritten automatically.
- Checks titles, descriptions, canonicals, heading order, image alt text, Open Graph, schema, internal links, breadcrumbs, robots and indexing tags, redirects and duplicate URLs, and whether key text is in the HTML or only shows up after scripts run.

## 2. Page-by-page recommendations
For each page:
- the issues, by severity
- a suggested short direct answer for the top of the page
- a heading outline
- FAQ ideas
- definitions of key terms
- internal links to add
- a side-by-side "before and after" preview

Every suggestion keeps **Facts** (with where each fact came from) separate from **Recommendations**, and lists **Missing information** in its own box.

## 3. Content plan (topical authority)
Page ideas based only on your confirmed services and locations: service, industry, problem, guide, glossary, and neutral comparison pages.

Each idea includes:
- search intent
- audience
- the main question it answers
- title, web address and H1
- outline
- internal links
- facts or evidence still needed
- recommended schema
- "needs approval" flag

Safeguards: no location pages for places you don't serve, and no near-copies of the same page.

## 4. Competitor analysis
- You paste competitor web addresses. We read their public pages and compare them with yours: services, audience, area covered, content depth, questions answered, how open their pricing is, trust signals and proof, technical SEO, schema, page speed and accessibility.
- The output is a list of original gap ideas. Competitor text is never copied. Anything not checked is labelled "needs verification".
- Brand mentions and referring domains use Semrush, which is already connected.

## 5. Entity and trust signals
- A schema editor for Organization / LocalBusiness, WebSite, Service, FAQPage, Article, BreadcrumbList and Review. Review schema is only offered for reviews you mark as genuine and permitted.
- Only confirmed fields are filled in. The editor checks the markup before saving, and approved markup appears on the live pages.
- A consistency check that business name, address, phone and web address match everywhere: footer, imprint, contact, schema.
- A checklist for the About, contact, team and author details, and policy pages (terms, privacy, refund, service), showing which exist and which are missing.

## 6. Technical SEO checklist
A pass/fail list built from the audit plus your existing checks (page speed, broken links, schema validation, sitemap, robots). Each item links to the fix or recommendation.

## 7. Generator
Creates:
- page briefs
- FAQ sections
- metadata
- schema markup
- internal-link suggestions
- content updates
- comparison outlines
- customer-question pages
- local service outlines

Rules for everything it creates:
- It uses only the confirmed facts sheet and text already on the site.
- It flags any missing information.
- It keeps facts and recommendations separate.
- It follows your tone of voice and avoids superlatives.
- It writes in Czech and British English.
- Everything goes to the approval queue.

## 8. Approval workflow
Each item moves: Draft → In review → Approved → Published, or Rejected. The history records who acted and when.

Publishing only touches content you can already edit safely (metadata, FAQ blocks, schema, homepage text). Larger page changes are exported for you or me to apply.

## 9. Measurement dashboard
- Pages audited, issues by severity, missing topics and questions, schema coverage, link opportunities, freshness.
- Search Console clicks and impressions (already connected), and rankings for the questions you track.
- **AI answer tracker:** you record what you actually saw: date, platform (ChatGPT, Perplexity, Gemini, Copilot, AI Overviews), question, country, language, device, source link, whether you were cited, and a screenshot or quote. Nothing is claimed unless it was recorded.
- Referring domains (Semrush), and enquiries by landing page (from your enquiry inboxes).

## 10. Exports
Markdown, HTML, JSON-LD and CSV for audits, briefs, schema and plans. Anything not yet confirmed carries a clear warning.

## What you'll need to do
After the build, fill in and confirm the facts sheet. Until then, the generator only drafts content marked "unverified".

---

## Technical section
- **New tables** (staff-read, admin-write, service role full access; grants on every table):
  - `geo_business_facts` (key, value, source, verified_by/at, locked)
  - `geo_page_audits` (url, run_id, scores jsonb, issues jsonb, html_snapshot_hash)
  - `geo_claims` (url, text, type, status)
  - `geo_content_plan` (the page-idea fields listed above)
  - `geo_competitors` and `geo_competitor_reports`
  - `geo_generated_items` (kind, facts jsonb, recommendations, missing_info, before/after, status, history)
  - `geo_schema_blocks` (page path, JSON-LD, validated, status)
  - `geo_ai_observations` (the tracker fields listed above)
- **Edge functions** (admin-gated):
  - `geo-audit`: fetches the live pages from the sitemap and checks crawlable HTML with a parser
  - `geo-competitor`: fetches pages you enter and uses Semrush for mentions and referring domains
  - `geo-generate`: Lovable AI on `google/gemini-3-flash-preview`, with a strict JSON schema of facts / recommendations / missing and the prompt limited to verified facts
  - `geo-export`
- **Live-page change:** the existing SEOHead / JSON-LD layer reads approved `geo_schema_blocks` and approved FAQ blocks per page path. The pre-rendering script includes them so crawlers see them in the HTML.
- **Admin routes:** `/admin/geo`, with tabs Overview, Facts, Audit, Pages, Plan, Competitors, Generator, Schema, Checklist, Approvals, AI tracker, Exports. The sidebar entry needs admin access.
- **Reused:** seo-sync-gsc, seo-sync-semrush, seo-pagespeed, seo-schema-validator, seo-broken-links, seo-content-freshness.
- **Build order:** facts and tables → audit and claims → recommendations and approvals → schema editor and live-page output → generator → competitors → dashboard, tracker and exports.

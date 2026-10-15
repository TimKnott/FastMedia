# FastMedia Widget Shop — plan and cost review (nothing built yet)

## What gets built

**1. Public shop page (/shop)**
- Grid of picture cards: PPC packages, SEO audit, social media advert tools, AI Ad Studio (with monthly AI credit allowance).
- Each card: picture, name, what's included, yearly price (paid once a year in advance), "Buy" button.
- Clear note on every advertising product: "Advert spend is paid separately to Google/Meta/Seznam — our fee covers management only."
- Czech first, English via toggle, "Nejsme plátci DPH" shown.

**2. Payment**
- Uses the Stripe checkout already on the site, charged yearly up front.
- After payment the customer gets an account with their product(s) switched on.

**3. Monthly credit limits for customers**
- Each plan has a fixed number of AI credits per month (e.g. adverts generated).
- Counter shown to the customer ("12 of 50 used this month"), resets monthly, tool stops at the limit with an upgrade button. Enforced on the server, so it can't be bypassed.

**4. Free website audit questionnaire + design tool**
- Step-by-step questions (business, current site, goals, budget), optional automatic check of their current website.
- Simple "design your website" picker (style, colours, sections) with a live preview.
- Email confirmation code before results are shown — stops fake leads.
- Results page with score and recommended package.

**5. Admin lead report (/admin/shop-leads)**
- Every audit/design submission with answers, score, chosen design, verified email, purchase status; CSV export; link to Prospecting desk.

**6. Customer advertising report (in the customer portal)**
- Per month: advert spend, clicks, enquiries, cost per enquiry.
- First version: you enter spend/clicks per customer in admin (or upload CSV); enquiries counted automatically from the site's forms. Automatic Google Ads/Meta import is a later step — it needs each customer's ad account connected.

## Cost review

**Build cost (Lovable build credits, one-off):** roughly 5–8 build sessions if done in phases:
- Phase 1: shop page + Stripe products + yearly checkout (2 sessions)
- Phase 2: credit allowances + customer counter (1–2)
- Phase 3: audit questionnaire + design tool + email verification + admin lead report (2)
- Phase 4: customer ad reporting (1–2)

**Running cost (app AI credits, only when used):**
- Audit with AI summary: about $0.001–0.01 each.
- Customer AI advert generation: about $0.0005 per advert — a 50/month allowance costs you under $0.05 per customer per month.
- Verification emails: covered by the existing email system.
- Stripe fees: about 2.9% + 30¢ per payment (domestic card), more for international cards.

**Recommendation:** build Phase 1 + Phase 3 first (shop + free audit = lead and sales engine), then Phases 2 and 4 once the first customer pays.

## Needed from you before building
1. Real yearly prices for each product (PPC packages, SEO audit, social advert tools, AI Ad Studio).
2. Monthly AI credit allowance per plan.
3. Does the 30-day money-back guarantee apply to these products?
4. Which phases to build now.

## Technical details
- New tables: shop_products, shop_orders, credit_ledger (monthly usage), audit_submissions (with email-verification codes), ad_reports. Restrictive RLS: customers see only their own rows, admins see all.
- Credit check + decrement in an edge function before any AI call; monthly reset by period key, no scheduled job needed.
- Stripe: yearly recurring prices via batch product creation; webhook (existing payments-webhook) activates entitlements.
- Email verification: 6-digit code via existing transactional email queue, 10-minute expiry, rate-limited.

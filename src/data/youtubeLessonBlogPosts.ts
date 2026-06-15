import type { BlogPost } from './blogPosts';
import blogWebsiteTrends from '@/assets/blog/blog-website-trends.jpg';
import blogRedesign from '@/assets/blog/blog-redesign.jpg';
import blogGoogleBusiness from '@/assets/blog/blog-google-business.jpg';

// British English only — cs/de fields mirror en to satisfy the trilingual schema
// while the public UI is locked to British English (see project memory).
const tri = (text: string) => ({ cs: text, en: text, de: text });

export const youtubeLessonBlogPosts: BlogPost[] = [
  {
    id: 'yt-great-website-principles',
    slug: 'what-makes-a-great-website-lessons-from-flux-academy',
    title: tri('What Makes a Great Website? Lessons from a 10-Minute Masterclass'),
    excerpt: tri(
      'A breakdown of Flux Academy\'s five principles of great website design — translated into practical fixes for tradespeople and service businesses ready to win more enquiries.',
    ),
    sections: [
      {
        type: 'paragraph',
        text: tri(
          'If you have ten minutes spare today, the single most valuable thing you can do for your business website is watch the short masterclass below. Ran Segall from Flux Academy distils more than a decade of design experience into five principles that separate a forgettable site from one that books out your diary. We have transcribed the key teaching points and rebuilt them around what actually matters for plumbers, electricians, salons, builders and every other service business we work with at FastMedia.Pro.',
        ),
      },
      {
        type: 'video-embed',
        url: 'https://www.youtube.com/watch?v=GZRfp1g8q9I',
        caption: tri('Flux Academy: The 5 Principles of Great Website Design'),
      },
      { type: 'heading', text: tri('1. Visual hierarchy decides what gets seen') },
      {
        type: 'paragraph',
        text: tri(
          'The video opens with a simple truth: every page has a hero element, a supporting element and noise. Visitors only ever notice the hero. On a trade site that hero should be either the outcome you deliver ("Boiler fixed today, fixed price") or the proof you can deliver it (a real photo of your team on a job). Anything that competes with that hero — stock photos, swirling sliders, three CTA buttons of equal weight — flattens the hierarchy and the page stops converting.',
        ),
      },
      {
        type: 'list',
        items: [
          tri('Pick ONE headline per page and make it physically larger than anything else.'),
          tri('Use a single primary call-to-action colour. Secondary actions get a ghost button.'),
          tri('Cut any image or icon that does not directly support the headline promise.'),
        ],
      },
      { type: 'heading', text: tri('2. White space is a feature, not wasted real estate') },
      {
        type: 'paragraph',
        text: tri(
          'Most DIY trade websites cram content edge-to-edge because the owner is afraid of "empty" space. Ran shows the opposite: generous padding around a headline raises perceived quality and lets the eye lock onto the message. Premium brands like Apple use 80–120px of breathing room around hero copy for a reason — it signals confidence.',
        ),
      },
      {
        type: 'callout',
        text: tri(
          'Every FastMedia.Pro template ships with a generous spacing scale (8, 16, 24, 48, 96px) baked in. You cannot accidentally make it look cluttered, even if you upload twenty extra photos.',
        ),
      },
      { type: 'heading', text: tri('3. Contrast is what people with phones actually need') },
      {
        type: 'paragraph',
        text: tri(
          'Around 70% of your visitors will land on the site from a phone, often outdoors in bright sunlight. Light-grey text on a white background fails accessibility checks AND is unreadable on a building site. The masterclass recommends a minimum 7:1 contrast ratio for body text — go test your current site at webaim.org/resources/contrastchecker.',
        ),
      },
      { type: 'heading', text: tri('4. Typography is 95% of the design') },
      {
        type: 'paragraph',
        text: tri(
          'Ran argues that if you only fix one thing on your website this month, fix the typography. Pair one geometric sans-serif (Inter, Space Grotesk, Manrope) for headings with a highly-legible body font, set body size to 18–20px and line-height to 1.6. The site instantly feels more expensive — without changing a single colour or photo.',
        ),
      },
      {
        type: 'quote',
        text: tri('You don\'t need a bigger budget. You need bigger type, more space and one clear message.'),
        author: 'Ran Segall, Flux Academy',
      },
      { type: 'heading', text: tri('5. Conversion-focused thinking from the first pixel') },
      {
        type: 'paragraph',
        text: tri(
          'The final principle is the one trade owners under-invest in: every section should move the visitor one step closer to an enquiry. Hero promises the outcome. Trust strip proves it (Checkatrade, Google reviews, years in business). Service grid removes objections. The contact form is short — name, postcode, problem — and never hides behind a "Contact" page.',
        ),
      },
      {
        type: 'list',
        items: [
          tri('Hero → outcome promise + primary CTA above the fold on mobile.'),
          tri('Trust strip → logos, ratings, certifications within the first scroll.'),
          tri('Services → benefit-led, not feature-led, with photos of YOUR work.'),
          tri('Proof → real testimonials with first name, town and photo.'),
          tri('CTA repeated every 1.5 screens because nobody scrolls back up.'),
        ],
      },
      {
        type: 'cta',
        text: tri('See these five principles applied to your trade — get a tailored proposal in 60 seconds →'),
        href: '/calculator',
        trackingLabel: 'blog-flux-academy-cta',
      },
    ],
    category: 'webdesign',
    image: blogWebsiteTrends,
    videoUrl: 'https://www.youtube.com/watch?v=GZRfp1g8q9I',
    author: 'Tim Knott',
    authorRole: tri('Founder, FastMedia.Pro'),
    date: '2026-06-12',
    readTime: 8,
    tags: ['web design', 'conversion', 'typography', 'masterclass'],
  },

  {
    id: 'yt-why-websites-fail-to-convert',
    slug: 'why-small-business-websites-fail-to-convert',
    title: tri('Why Most Small-Business Websites Fail to Convert (and How to Fix Yours)'),
    excerpt: tri(
      'Wes McDowell\'s diagnostic for under-performing small-business sites, rebuilt as a step-by-step checklist for trade and service businesses losing leads every week.',
    ),
    sections: [
      {
        type: 'paragraph',
        text: tri(
          'You are getting traffic. The analytics tab is green. The phone still does not ring. Sound familiar? In the video below, conversion specialist Wes McDowell tears down the four mistakes 90% of small-business websites make — and the fixes take an afternoon, not a re-build.',
        ),
      },
      {
        type: 'video-embed',
        url: 'https://www.youtube.com/watch?v=9V2y7Y9aGZk',
        caption: tri('Wes McDowell: Why your website isn\'t converting (and how to fix it)'),
      },
      { type: 'heading', text: tri('Mistake 1: the homepage talks about you, not the customer') },
      {
        type: 'paragraph',
        text: tri(
          'Wes calls this the "About Us trap". A visitor lands on the page and reads: "Welcome to Smith & Sons, established 1987, family-run plumbing firm based in…". The visitor does not care. They have a leaking radiator at 9pm. The headline must answer their unspoken question: "Can you fix MY problem, fast, fairly?" Rewrite the hero in the format: [Outcome they want] + [in the timescale they need] + [without the thing they fear].',
        ),
      },
      {
        type: 'callout',
        text: tri(
          'Bad: "Welcome to Smith & Sons Plumbing". Good: "Boiler back on today — fixed price, no call-out fee, Gas Safe registered".',
        ),
      },
      { type: 'heading', text: tri('Mistake 2: too many calls-to-action — and none of them obvious') },
      {
        type: 'paragraph',
        text: tri(
          'When a visitor sees five buttons (Book, Quote, Call, Email, WhatsApp, Newsletter…) they choose none. The video recommends one primary CTA repeated on every section, plus one secondary "lower commitment" option. For service businesses we suggest: primary = "Book a 15-min call" or "Get a fixed quote", secondary = "WhatsApp us a photo".',
        ),
      },
      {
        type: 'list',
        items: [
          tri('One primary CTA in your brand accent colour, repeated every 1.5 screens.'),
          tri('Secondary CTA as a low-commitment fallback (WhatsApp, download a price guide).'),
          tri('Kill every other button — yes, including the newsletter sign-up in the hero.'),
        ],
      },
      { type: 'heading', text: tri('Mistake 3: no social proof above the fold') },
      {
        type: 'paragraph',
        text: tri(
          'Wes shares the data point that 88% of visitors trust online reviews as much as a personal recommendation. Yet most trade sites bury the testimonials at the bottom of the page. Move them up. Pull your Google rating, Checkatrade score and a 1-line testimonial into a thin strip directly under the hero. Conversion lifts measured in the video: 15–35%.',
        ),
      },
      {
        type: 'quote',
        text: tri('If a stranger has to scroll three screens to find proof you are legit, they will go to your competitor instead.'),
        author: 'Wes McDowell',
      },
      { type: 'heading', text: tri('Mistake 4: the contact form is a 12-field interrogation') },
      {
        type: 'paragraph',
        text: tri(
          'Every extra field on a form reduces completion by roughly 4%. A "name, postcode, message, photo upload" form will out-convert a "name, surname, email, phone, address, town, postcode, service type, preferred date, preferred time, how did you hear about us, GDPR tickbox" form every day of the week. Collect the rest on the phone call.',
        ),
      },
      { type: 'heading', text: tri('Mistake 5 (bonus): the mobile experience is an afterthought') },
      {
        type: 'paragraph',
        text: tri(
          'The masterclass closes with the reminder that for service businesses, mobile is not "important" — it IS the website. Test yours by loading it on 4G with brightness at 50% outdoors. If you cannot read the headline, tap the CTA without zooming, or call the number with one thumb, you are leaking leads every single day.',
        ),
      },
      {
        type: 'list',
        items: [
          tri('Sticky "Call now" bar at the bottom of every mobile page.'),
          tri('Tap targets minimum 48×48px with 8px spacing.'),
          tri('Hero loads in under 2.5 seconds on a mid-range Android.'),
          tri('Forms use the correct input keyboards (tel, email, number).'),
        ],
      },
      {
        type: 'cta',
        text: tri('Want a free 5-minute audit of your homepage against this checklist? Start your enquiry →'),
        href: '/inquiry',
        trackingLabel: 'blog-wes-mcdowell-cta',
      },
    ],
    category: 'marketing',
    image: blogRedesign,
    videoUrl: 'https://www.youtube.com/watch?v=9V2y7Y9aGZk',
    author: 'Tim Knott',
    authorRole: tri('Founder, FastMedia.Pro'),
    date: '2026-06-13',
    readTime: 9,
    tags: ['conversion', 'small business', 'CRO', 'website fixes'],
  },

  {
    id: 'yt-local-seo-2026',
    slug: 'local-seo-2026-plumbers-guide-to-google',
    title: tri('Local SEO in 2026: A Plumber\'s Guide to Ranking on Google'),
    excerpt: tri(
      'A field-tested local SEO playbook for trades and service businesses, distilled from the latest Ahrefs masterclass and adapted to how Google actually ranks in 2026.',
    ),
    sections: [
      {
        type: 'paragraph',
        text: tri(
          'Search "emergency plumber near me" in any UK town and three local businesses will dominate the map pack. They are not always the biggest companies — they are the ones that did the boring local SEO work everyone else skipped. The Ahrefs masterclass below covers the entire 2026 ranking playbook in under 25 minutes. Below the video we have turned each chapter into a checklist you can hand to your team this week.',
        ),
      },
      {
        type: 'video-embed',
        url: 'https://www.youtube.com/watch?v=k4Z2BNbUz-Y',
        caption: tri('Ahrefs: Local SEO tutorial for small business owners'),
      },
      { type: 'heading', text: tri('Step 1: nail your Google Business Profile') },
      {
        type: 'paragraph',
        text: tri(
          'The map pack ranks profiles, not websites. The video stresses three under-used GBP fields: services (add every service you offer with descriptions), products (yes — use it even for a service business, with photos of past jobs) and the Q&A section (seed it with your five most common questions and answer them yourself). Profiles with all three populated rank 40% higher in the Ahrefs case study.',
        ),
      },
      {
        type: 'list',
        items: [
          tri('Categories: one primary + every relevant secondary (do not stuff).'),
          tri('Services: add each one with a 100–200 character description.'),
          tri('Photos: upload 1 new photo every week, geo-tagged to your service area.'),
          tri('Posts: publish a "what we did this week" update every Friday.'),
        ],
      },
      { type: 'heading', text: tri('Step 2: NAP consistency across the entire web') },
      {
        type: 'paragraph',
        text: tri(
          'Name, Address, Phone number — written identically everywhere. Ahrefs shows that even minor variations ("Street" vs "St.", "020 7946 0958" vs "0207 946 0958") confuse Google and split your authority. Use a free tool like Moz Local or simply spreadsheet 30 directories and audit them once. Fix the worst offenders: Yell, Yelp, Bing Places, Apple Maps, Checkatrade, TrustATrader, Facebook.',
        ),
      },
      {
        type: 'callout',
        text: tri(
          'FastMedia.Pro sites publish your NAP in JSON-LD LocalBusiness schema automatically, so Google ingests the canonical version from the source — no manual citation hunting required.',
        ),
      },
      { type: 'heading', text: tri('Step 3: review velocity beats review volume') },
      {
        type: 'paragraph',
        text: tri(
          'A profile with 200 reviews from 2019 ranks below a profile with 30 reviews from the last 90 days. The video recommends a simple, ethical system: a one-tap review-request link sent by SMS within 30 minutes of finishing a job, while the customer is still delighted. Target two new genuine 5-star reviews per week.',
        ),
      },
      {
        type: 'quote',
        text: tri('Google does not just count your reviews. It counts how fresh they are and how you respond to them.'),
        author: 'Sam Oh, Ahrefs',
      },
      { type: 'heading', text: tri('Step 4: build one location landing page per town') },
      {
        type: 'paragraph',
        text: tri(
          'If you serve Reading, Wokingham and Bracknell, you need three pages — not one "Areas We Cover" list. Each page should have: a unique 600+ word intro, a real photo of a recent job in that town, 2–3 local testimonials, a map with the service-area polygon, and an FAQ answering the questions specific to that area (parking restrictions, local water hardness, building age — whatever is genuinely different).',
        ),
      },
      { type: 'heading', text: tri('Step 5: structured data is no longer optional') },
      {
        type: 'paragraph',
        text: tri(
          'In 2026 Google Search uses Gemini-powered "AI Overviews" for an increasing share of local queries, and those overviews are sourced primarily from structured data. The masterclass walks through the four schemas every trade site must have: LocalBusiness, Service, Review/AggregateRating and FAQPage. If you cannot read JSON-LD, that is fine — the right platform (or developer) sets it up once and updates it automatically as content changes.',
        ),
      },
      {
        type: 'list',
        items: [
          tri('LocalBusiness — NAP, hours, geo, service area, payment methods.'),
          tri('Service — one entry per service with priceRange and description.'),
          tri('AggregateRating — pulled live from your real review platform.'),
          tri('FAQPage — your 5 most-asked questions, answered in 40–60 words each.'),
        ],
      },
      { type: 'heading', text: tri('Step 6: track only the metrics that pay you') },
      {
        type: 'paragraph',
        text: tri(
          'Ignore "impressions" and "average position" — they are vanity. The video closes by recommending three metrics only: phone calls attributed to GBP, direction requests, and booked-job revenue per channel. Set those up in GA4 and your CRM, review them weekly, and you will know within 30 days whether your local SEO is actually working.',
        ),
      },
      {
        type: 'cta',
        text: tri('Want a website with all 4 local-SEO schemas baked in from day one? Get your tailored proposal →'),
        href: '/calculator',
        trackingLabel: 'blog-ahrefs-local-seo-cta',
      },
    ],
    category: 'seo',
    image: blogGoogleBusiness,
    videoUrl: 'https://www.youtube.com/watch?v=k4Z2BNbUz-Y',
    author: 'Tim Knott',
    authorRole: tri('Founder, FastMedia.Pro'),
    date: '2026-06-14',
    readTime: 10,
    tags: ['local SEO', 'Google Business Profile', 'schema', 'trades'],
  },
];

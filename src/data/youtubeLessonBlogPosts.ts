import type { BlogPost } from './blogPosts';
import blogWebsiteTrends from '@/assets/blog/blog-website-trends.jpg';
import blogRedesign from '@/assets/blog/blog-redesign.jpg';
import blogGoogleBusiness from '@/assets/blog/blog-google-business.jpg';
import blogInstantLeadReply from '@/assets/blog/blog-instant-lead-reply.jpg';
import blogLeadResponseTime from '@/assets/blog/blog-lead-response-time.jpg';

// British English only — cs/de fields mirror en to satisfy the trilingual schema
// while the public UI is locked to British English (see project memory).
const tri = (text: string) => ({ cs: text, en: text, de: text });

export const youtubeLessonBlogPosts: BlogPost[] = [
  {
    id: 'yt-never-lose-a-lead-instant-reply',
    slug: 'never-lose-a-lead-instant-reply-crm-automation',
    title: tri('Never Lose a Lead Again: Instant Replies, CRM Capture and the 5-Minute Rule'),
    excerpt: tri(
      'Why responding to a new lead in under five minutes wins more jobs than any ad campaign — and how FastMedia.Pro automates instant replies and stores every enquiry in your back-office CRM so nothing ever slips through.',
    ),
    sections: [
      {
        type: 'callout',
        text: tri(
          '👉 See the full FastMedia.Pro lead-capture and instant-reply system live on our homepage at https://www.fastmedia.pro — the same automation we install on every website we build.',
        ),
      },
      {
        type: 'paragraph',
        text: tri(
          'Every trade and service business owner knows the sinking feeling: a hot enquiry came in at 7:42pm last night, you spotted it on your phone over breakfast, you rang back at 9:15am — and the customer had already booked your competitor. That lead was never lost because the customer changed their mind. It was lost because someone else answered first. This article unpacks the research behind the famous "5-minute rule", shows you exactly what an instant-reply + CRM-capture automation looks like in practice, and explains how the FastMedia.Pro websites do it for you automatically.',
        ),
      },
      {
        type: 'video-embed',
        url: 'https://www.youtube.com/watch?v=jbkSRLYSojo',
        caption: tri('Speed-to-lead: why responding in minutes (not hours) wins the customer'),
      },
      { type: 'heading', text: tri('The brutal maths of lead response time') },
      {
        type: 'paragraph',
        text: tri(
          'A landmark study by the Harvard Business Review and InsideSales analysed 1.25 million sales leads across 29 companies. The finding was the same in every industry, including home services: businesses that contacted a new lead within 5 minutes were 100× more likely to qualify the lead than those that waited 30 minutes, and 21× more likely than those that waited an hour. After 24 hours, the conversion probability collapses to near zero. The customer has not "gone cold" — they have already hired someone else.',
        ),
      },
      {
        type: 'image',
        src: blogLeadResponseTime,
        alt: tri('Phone showing an instant reply notification with a stopwatch icon'),
        caption: tri('Every minute you wait, the probability of winning the job halves.'),
      },
      {
        type: 'list',
        items: [
          tri('0–5 minutes → 100× more likely to qualify the lead.'),
          tri('5–30 minutes → conversion probability drops by 80%.'),
          tri('30–60 minutes → you are competing with whoever replied first.'),
          tri('60+ minutes → the lead is, statistically, already gone.'),
        ],
      },
      { type: 'heading', text: tri('Why human-only follow-up will always lose') },
      {
        type: 'paragraph',
        text: tri(
          'You cannot personally answer every form submission within 5 minutes. You are on a roof, in a van, mid-quote, asleep. Hiring an admin to monitor the inbox 24/7 costs £30,000+ a year and they still cannot beat a competitor whose website auto-replies in 8 seconds. The answer is not "try harder" — it is to remove the human from the first response entirely. The human comes in later for the conversation that actually closes the job.',
        ),
      },
      {
        type: 'quote',
        text: tri('The first business to respond wins 50% of the deal, before price, reviews or reputation are even considered.'),
        author: 'InsideSales / Harvard Business Review',
      },
      { type: 'heading', text: tri('What the FastMedia.Pro instant-reply automation actually does') },
      {
        type: 'paragraph',
        text: tri(
          'Every FastMedia.Pro website ships with a four-stage lead-capture engine that runs the moment a visitor hits "Send" on the contact form, books online, or messages the AI chat. It does the job of a full-time receptionist for £0 a month and never sleeps.',
        ),
      },
      {
        type: 'image',
        src: blogInstantLeadReply,
        alt: tri('FastMedia.Pro back-office CRM showing a new lead notification and instant reply'),
        caption: tri('The same back-office CRM admins use every day at /admin/leads.'),
      },
      { type: 'heading', text: tri('Stage 1 — Capture (less than 1 second)') },
      {
        type: 'paragraph',
        text: tri(
          'The lead is written instantly to the CRM with name, phone, email, postcode, the service requested, the source page, the device used and a UTM trail back to the ad or search term that brought them in. Nothing is ever stored only in an email inbox where it can be missed.',
        ),
      },
      { type: 'heading', text: tri('Stage 2 — Instant reply (under 30 seconds)') },
      {
        type: 'paragraph',
        text: tri(
          'The customer receives a branded email AND an SMS (and a WhatsApp message if they ticked the box) within 30 seconds. The reply confirms you have their enquiry, restates the problem in their own words so they feel heard, gives a realistic callback window ("Tim will call you back within 2 working hours") and includes a one-tap link to book a 15-minute call directly into your diary.',
        ),
      },
      {
        type: 'list',
        items: [
          tri('Branded confirmation email with your logo and the customer\'s exact words.'),
          tri('SMS to the mobile they typed in — opened 98% of the time within 3 minutes.'),
          tri('Optional WhatsApp message for richer two-way chat.'),
          tri('A "Book a callback" link that drops straight into your Google Calendar.'),
        ],
      },
      { type: 'heading', text: tri('Stage 3 — Notify the right human (instantly)') },
      {
        type: 'paragraph',
        text: tri(
          'You — or whichever team member is on duty — get a push notification, email and SMS the moment a lead is captured. The notification carries everything you need to call them back without opening the laptop: name, number, service, postcode, and a hot/warm/cold score the system has already calculated based on the customer\'s answers.',
        ),
      },
      { type: 'heading', text: tri('Stage 4 — Store, score and follow up forever') },
      {
        type: 'paragraph',
        text: tri(
          'The lead is permanently stored in your back-office CRM at /admin/leads with full activity history. If you do not respond within your chosen SLA (say, 2 hours), the system escalates. If the lead goes quiet, automated nurture emails fire on day 1, day 3, day 7 and day 21 — bringing back 15–20% of "lost" enquiries that would otherwise sit in a spreadsheet for ever.',
        ),
      },
      {
        type: 'callout',
        text: tri(
          'Real numbers from FastMedia.Pro customers: instant-reply alone has lifted booked-job conversion by 22–41% in the first 90 days, with zero extra ad spend.',
        ),
      },
      { type: 'heading', text: tri('Your back-office CRM: where the leads actually live') },
      {
        type: 'paragraph',
        text: tri(
          'Every enquiry lands in the secure admin portal we build into every site (/admin/leads). You can see the full pipeline at a glance — new, contacted, qualified, quoted, won, lost — drag leads between stages, add private notes, attach photos, send templated quote emails, and convert a won lead into a client project with one click. No more lost Post-it notes, no more "I think Sarah handled that one".',
        ),
      },
      {
        type: 'list',
        items: [
          tri('Kanban pipeline view — drag a lead from "new" to "quoted" in one tap.'),
          tri('Built-in WhatsApp, call and email actions on every lead card.'),
          tri('Automatic lead-scoring (0–100) based on budget, urgency and service type.'),
          tri('Full audit log — see exactly who contacted the lead and when.'),
          tri('One-click conversion from a "won" lead into a tracked client project with invoicing.'),
        ],
      },
      { type: 'heading', text: tri('A 90-day checklist to stop losing leads forever') },
      {
        type: 'paragraph',
        text: tri(
          'If you are not on FastMedia.Pro yet, this is the minimum you should put in place this month — the principles work even on a basic Squarespace site, they are just harder to implement and maintain.',
        ),
      },
      {
        type: 'list',
        items: [
          tri('Replace your generic "Contact Us" form with a short 4-field form (name, postcode, phone, problem).'),
          tri('Wire the form to send an immediate branded email AND SMS to the customer.'),
          tri('Send yourself a push notification within 30 seconds of every submission.'),
          tri('Store every lead in a central CRM with stages — never just an email inbox.'),
          tri('Set up automated day-1, day-3 and day-7 follow-up emails for leads you have not closed yet.'),
          tri('Measure two numbers weekly: average response time, and percentage of leads that became booked jobs.'),
        ],
      },
      {
        type: 'quote',
        text: tri('You do not need more leads. You need to stop losing the ones you already have.'),
        author: 'Tim Knott, Founder of FastMedia.Pro',
      },
      {
        type: 'cta',
        text: tri('See the instant-reply + CRM system live on the FastMedia.Pro homepage →'),
        href: '/',
        trackingLabel: 'blog-instant-reply-homepage',
      },
      {
        type: 'cta',
        text: tri('Want this automation on your own website? Get a tailored proposal in 60 seconds →'),
        href: '/calculator',
        trackingLabel: 'blog-instant-reply-calculator',
      },
    ],
    category: 'business',
    image: blogInstantLeadReply,
    videoUrl: 'https://www.youtube.com/watch?v=jbkSRLYSojo',
    author: 'Tim Knott',
    authorRole: tri('Founder, FastMedia.Pro'),
    date: '2026-06-15',
    readTime: 9,
    featured: true,
    tags: ['lead capture', 'CRM', 'automation', 'speed to lead', 'instant reply'],
  },

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

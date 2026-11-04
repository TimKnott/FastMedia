// Single source of truth for routes the prerender script writes per-page HTML for.
// Dynamic routes (blog articles, legal docs, custom demos) are fetched at
// build time via the anon Supabase key.

import { createClient } from "@supabase/supabase-js";
import { calculatorFeatures } from "../src/data/calculatorFeatures.ts";
import { getFeatureDetail } from "../src/data/featureDetails.ts";
import { serviceLandings } from "../src/data/serviceLandings.ts";
import { industryLandings } from "../src/data/industryLandings.ts";
import { publicSeo } from '../src/lib/publicSeo.ts';
import { languageLocales } from '../src/lib/publicLanguage.ts';
import { isIndexablePath } from './seo-html.ts';
import { blogPosts } from '../src/data/blogPosts.ts';
import { safeSeoFetch, languageAlternatives, pickSeoText } from '../src/lib/seoDynamic.ts';

export interface RouteSeo {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
  /** Route-specific H1 for the crawler content block (defaults to title). */
  h1?: string;
  /** Route-specific paragraphs for the crawler content block. */
  contentBlocks?: string[];
  language?: string;
  /** Prerender with robots noindex and keep out of sitemaps/crawler links. */
  noindex?: boolean;
  alternates?: Array<{ language: string; path: string }>;
}

const BRAND = "FastMedia.Pro";
const OG_IMG = "https://www.fastmedia.pro/og-image.jpg";

export const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://www.fastmedia.pro/#organization",
  name: "FastMedia.Pro",
  url: "https://www.fastmedia.pro/",
  logo: "https://www.fastmedia.pro/favicon.jpeg",
  image: "https://www.fastmedia.pro/pwa-512x512.png",
  email: "support@fastmedia.pro",
  telephone: "+420797864432",
  founder: { "@type": "Person", name: "Timothy Knott" },
  taxID: "17308551",
  identifier: { "@type": "PropertyValue", propertyID: "IČO", value: "17308551" },
  address: { "@type": "PostalAddress", addressLocality: "Louny", postalCode: "440 01", addressRegion: "Ústecký kraj", addressCountry: "CZ" },
  areaServed: [{ "@type": "Country", name: "Czech Republic" }, { "@type": "Place", name: "European Union" }],
  knowsLanguage: ["bg","hr","cs","da","nl","en","et","fi","fr","de","el","hu","ga","it","lv","lt","mt","pl","pt","ro","sk","sl","es","sv"],
  contactPoint: { "@type": "ContactPoint", telephone: "+420797864432", email: "support@fastmedia.pro", contactType: "sales", availableLanguage: ["cs", "en"] },
};

const STATIC_ROUTES: RouteSeo[] = [
  {
    path: '/equestrian', language: 'cs-CZ', title: 'Weby pro stáje a jezdecké podniky | FastMedia.Pro',
    description: 'Weby na míru pro stáje, jezdecké školy a ubytování. Ilustrativní rezervace a kapacity, plánování funkcí a nezávazná poptávka.',
    h1: 'Více času s koňmi. Web za vás vyřídí administrativu.', ogImage: OG_IMG,
    contentBlocks: ['Navrhujeme weby a propojené nástroje na míru stájím, jezdeckým školám a venkovským ubytováním. Péče o koně a rozhodování zůstávají na lidech.', 'Ilustrativní miniweby a kalendář ukazují služby a dostupnost podle personálu, koní, jízdárny, boxů či pokojů. Nejde o skutečný zákaznický web ani ostrý rezervační systém.', 'Kalkulačka času používá vaše zadané hodiny administrativy, hodinovou hodnotu práce a odhad možné úspory. Výsledek je ilustrativní, nikoli zaručená úspora. Propojení kalendářů a marketingových nástrojů závisí na podporované integraci a oprávněních.'],
    jsonLd: { '@context': 'https://schema.org', '@type': 'Service', name: 'Weby pro jezdecké podniky', url: 'https://www.fastmedia.pro/equestrian', provider: { '@id': 'https://www.fastmedia.pro/#organization' } },
  },
  { path: '/launch', title: 'FastMedia launch film and programme | FastMedia.Pro', description: 'Watch the FastMedia launch film and explore the creative programme and official press kit.', contentBlocks: ['Watch the FastMedia launch film and explore the current creative programme.', 'The media kit provides company and press information. Contact us to discuss a website project.'], ogImage: OG_IMG },
  // Hidden from search until real reviews exist (owner decision).
  { path: '/reviews', title: 'Reviews and feedback | FastMedia.Pro', description: 'Read approved feedback where available and submit your experience of FastMedia.Pro. Reviews are moderated before public display.', contentBlocks: ['Read approved feedback where available. Submitted reviews are moderated before public display; no rating or outcome is guaranteed.'], ogImage: OG_IMG, noindex: true },
  { path: '/partners', title: 'Referral partner programme | FastMedia.Pro', description: 'Learn about the FastMedia.Pro referral partner programme. Registration, rewards and eligibility depend on the published programme rules.', contentBlocks: ['Introduce a business that needs a website through the referral programme when registration is open.', 'Commission rates, eligibility and terms must be confirmed in the programme rules. No reward amount is promised before agreement.'], ogImage: OG_IMG },

  {
    path: '/business',
    title: 'Web s rezervacemi za 20 € měsíčně | FastMedia.Pro',
    description: 'Web ze šablony s rezervacemi a hostingem za 20 € měsíčně. Bez zřizovacího poplatku a poplatku za návrh. Měsíční kontroly a až hodina vyžádaných úprav.',
    language: 'cs-CZ',
    changefreq: 'monthly',
    priority: '0.7',
    h1: 'Web pro řemeslníky a služby za 20 € měsíčně',
    contentBlocks: ['Web z oborové šablony, online rezervační kalendář a hosting v měsíční ceně služby. Bez zřizovacího poplatku a poplatku za návrh.', 'Společně projdeme nápad a vybranou šablonu před spuštěním. Každý měsíc proaktivně kontrolujeme hladký chod a aktuálnost webu. Zákazník může požádat o úpravy v rozsahu až jedné hodiny práce měsíčně; nejedná se o neomezené úpravy ani velké nové funkce.', 'Registraci domény, SSL, limity rezervací, minimální délku smlouvy a výpověď potvrdíme před dohodou.', 'Funkce na míru lze objednat zvlášť: každý požadavek individuálně posoudíme a před zahájením práce nabídneme férovou cenu. Nejsou zahrnuty v měsíční ceně ani v hodině vyžádaných úprav.'],
  },
  {
    path: "/",
    title: "FastMedia.Pro — Websites for Trades & Services",
    description:
      "Websites for trades and service businesses, booking flows and tailored digital tools. Explore templates or plan your project with FastMedia.Pro.",
    ogImage: OG_IMG,
    changefreq: "weekly",
    priority: "1.0",
    jsonLd: [orgJsonLd, { "@context": "https://schema.org", "@type": "WebSite", name: BRAND, url: "https://www.fastmedia.pro/", inLanguage: ["cs", "en", "de"] }],
    h1: "Bespoke websites, calculators and booking forms, with free EU creative grant help",
    contentBlocks: [
      "FastMedia.Pro builds bespoke websites, interactive price calculators, booking forms and API/CRM integrations for businesses in the Czech Republic and across the EU, in any of the 24 official EU languages.",
      "We help Czech businesses prepare for the EU creative grant (Kreativni vouchery), which can cover up to 85% of eligible bespoke work, capped at 150,000 CZK, with a free course, a business plan template and AI prompts that work in any language. FastMedia.Pro is not the grant agency.",
    ],
  },
  {
    path: "/blog",
    title: "Blog — Marketing and web design tips for trades | FastMedia.Pro",
    description:
      "Practical website, SEO and marketing articles for tradespeople and service businesses. Read guidance, examples and planning tips from FastMedia.Pro.",
    ogImage: OG_IMG,
    changefreq: "daily",
    priority: "0.8",
  },
  {
    path: "/calculator",
    h1: "Plan your website with the cost calculator",
    contentBlocks: ["Choose your business type, pages and requested features. The calculator uses the configured modules and their one-off and recurring prices to assemble an illustrative project estimate and proposal PDF.", "For example, a service business can compare a contact website with an online booking option, while a retailer can explore catalogue and payment requirements. Optional AI guidance helps with feature selection; it does not replace review of your requirements.", "Prices and timing are planning estimates, not guarantees of sales, search rankings or project delivery. Confirm scope, integrations, recurring charges and final terms with FastMedia.Pro before agreement. Do not include sensitive customer information in your brief."],
    jsonLd: { "@context": "https://schema.org", "@type": "WebApplication", name: "FastMedia.Pro Website Cost Calculator", url: "https://www.fastmedia.pro/calculator", applicationCategory: "BusinessApplication", operatingSystem: "Web browser", description: "Configure website modules and compare illustrative one-off and recurring project costs." },
    title: "Website Cost Calculator | FastMedia.Pro",
    description:
      "Use our AI calculator to scope a new website: pick features, see prices in real time, and download a tailored proposal PDF. No phone call required.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/inquiry",
    title: "Start your project — Get a tailored proposal | FastMedia.Pro",
    description:
      "Tell us about your business and we'll send a detailed proposal, timeline and fixed quote within 24 hours.",
    ogImage: OG_IMG,
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/about",
    title: "About FastMedia.Pro — Timothy Knott, Louny, Czech Republic",
    description:
      "FastMedia.Pro is run by Timothy Knott (IČO 17308551) from Louny, Czech Republic, serving businesses across the Czech Republic and the EU.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/contact",
    title: "Contact FastMedia.Pro — Talk to Our Web Team",
    description:
      "Get in touch about a new website, redesign or ongoing support. Message, call or WhatsApp us — we reply within one working day.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/offer",
    title: "Bespoke Websites With a 30-Day Happiness Guarantee | FastMedia.Pro",
    description:
      "A mobile-first, bilingual website built by a British web team in Czechia. AI lead assistant, bookings and payments, with a 30-day money-back guarantee.",
    ogImage: OG_IMG,
    changefreq: "weekly",
    priority: "0.9",
    h1: "Bespoke websites with a 30-day happiness guarantee",
    contentBlocks: [
      "FastMedia.Pro builds bespoke, mobile-first websites for Czech businesses, written in perfect British English when you need it, with an AI lead assistant, bookings, payments and SEO built in.",
      "If you are not happy within 30 days of publishing, you get a full refund. See the case studies, packages and instant cost calculator on the page.",
    ],
  },
  {
    path: "/demos",
    title: "Industry Website Demos | FastMedia.Pro",
    description:
      "Live demo websites for trades, services, health and hospitality businesses, each with online booking and enquiry forms. Pick your industry and explore.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.7",
    h1: "Industry website demos",
    contentBlocks: [
      "Browse live demo websites for plumbers, electricians, salons, caterers, florists, vets, accountants and many more industries.",
      "Each demo shows the layout, services, gallery, opening hours and booking or enquiry forms a FastMedia.Pro website can include.",
    ],
  },
  {
    path: "/grants",
    title: "Czech Digitalisation Grants for a New Website | FastMedia.Pro",
    description:
      "An honest guide to Czech and EU digitalisation grant programmes, who can apply, what a website project needs, and the documents we prepare for your application.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.7",
    h1: "Czech digitalisation grants for a new website",
    contentBlocks: [
      "Czech and EU digitalisation programmes such as OP TAK Digitální podnik can support digitalisation projects for small and medium-sized businesses, and a website is often an eligible cost within a wider project.",
      "Eligibility, support rates and open calls are decided by the grant provider. We prepare the technical specification, itemised quotation and supplier documents your application needs.",
    ],
  },
  {
    path: "/eugrants",
    title: "Creative Voucher Regional Partners in All 14 Czech Regions | FastMedia.Pro",
    description:
      "An interactive map of the regional innovation partners administering Kreativni vouchery in all 14 Czech regions, from ICUK and SIC to JIC, MSIC and TIC Zlin.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.7",
    h1: "Creative voucher regional partners by region",
    contentBlocks: [
      "Each Czech region has its own innovation partner that publishes creative voucher calls and receives applications, including Pii in Prague, SIC in Central Bohemia, ICUK in the Usti Region, JIC in South Moravia and MSIC in the Moravian-Silesian Region.",
      "Select your region to see the partner handling your application, alongside the national pool administered through the DPMK portal under the National Recovery Plan.",
    ],
  },
  {
    path: "/grant-process",
    title: "Creative Vouchers: Application Process, Deadlines, Documents | FastMedia.Pro",
    description:
      "How a Kreativni vouchery application runs step by step: the seven phases of a call, the deadlines you cannot miss, and every document needed for the application and final accounting.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
    h1: "The creative voucher application process, deadlines and documents",
    contentBlocks: [
      "A creative voucher application runs in fixed phases: the regional partner publishes the call, the applicant prepares an itemised supplier quotation and technical specification, submits electronically within the fixed window, waits for assessment, and may only start delivery after the decision or signed contract.",
      "The application pack typically includes register extracts, debt-free confirmations, an SME declaration, a de minimis declaration covering three years, a project description, an itemised quotation and evidence the supplier is listed in the national gallery of creatives.",
      "Final accounting requires the supplier invoice, proof of payment, project outputs and a final report. The partner then reimburses 85 per cent of eligible costs up to 150,000 CZK, so the applicant must pre-finance the full invoice.",
    ],
  },
  {
    path: "/case-studies",
    title: "Website Case Studies and Results | FastMedia.Pro",
    description:
      "Explore FastMedia.Pro website examples, screenshots and project write-ups. Illustrative examples are labelled; discuss the features relevant to your business.",
    ogImage: OG_IMG,
    changefreq: "weekly",
    priority: "0.8",
    h1: "Website examples and project write-ups",
    contentBlocks: [
      "Explore the business context, design and features described in each project write-up. Illustrative examples are not evidence of customer outcomes; only confirmed project material should be treated as client work.",
      "Studies span trades, beauty and wellness, e-commerce and construction. Every case study can be opened in the browser as a PDF or downloaded for sharing internally.",
    ],
  },
  {
    path: "/courses",
    title: "Free Website & EU Grant Courses | FastMedia.Pro",
    description:
      "Free online courses on planning and building a website and on the EU creative voucher system that funds up to 85% of eligible costs for Czech businesses.",
    ogImage: OG_IMG,
    changefreq: "weekly",
    priority: "0.8",
    h1: "Learn to plan a website - and fund it with European grants",
    contentBlocks: [
      "FastMedia Academy publishes short, practical courses for Czech business owners: how to plan a website, what to brief a designer, how to measure results, and how the EU creative voucher system works in practice.",
      "The grant course explains eligibility, the 85% support rate capped at 150,000 CZK, the required documents and how to describe a project so assessors approve it. Every course is currently free.",
    ],
  },
  {
    path: "/eu-creative-grant",
    title: "EU Creative Grant for Websites: Free Help to Apply | FastMedia.Pro",
    description: "How Czech businesses can use the creative voucher to fund up to 85% of a bespoke website, capped at 150,000 CZK. Free course, business plan and AI prompts.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
    h1: "EU creative grant for websites: how to get up to 85% funded",
    contentBlocks: ["Czech businesses can use the creative voucher programme (Kreativni vouchery) to cover up to 85% of eligible bespoke creative work, such as a custom website, capped at 150,000 CZK.", "FastMedia.Pro is a web supplier, not the grant agency: we prepare you with a free course, a ready-made business plan and application drafts, and AI prompts that work in any language."],
  },
  {
    path: "/grant-business-plan",
    title: "Creative Voucher Business Plan Template & AI Prompts | FastMedia.Pro",
    description: "A free pro-forma business plan and application draft for the Czech creative voucher, with copy-ready AI prompts to write it in any language.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
    h1: "Business plan template and AI prompts for the creative voucher",
    contentBlocks: ["FastMedia.Pro provides a free pro-forma business plan and application draft for the Czech creative voucher, plus AI prompts to write, check and translate your application in any language."],
  },
  {
    path: "/eu-language-websites",
    title: "Websites in Every EU Language, Written for Each Market | FastMedia.Pro",
    description: "FastMedia.Pro builds full language versions of your website in any of the 24 official EU languages, written for each market rather than just translated.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
    h1: "Websites in every official EU language, not just translations",
    contentBlocks: ["FastMedia.Pro builds full language versions of a website in any of the 24 official EU languages, each written for its own market rather than translated word for word.", "Also available: interactive calculators, booking forms, API and CRM integrations."],
  },
  {
    path: "/grant-eligibility",
    title: "Creative Voucher Eligibility Rules Explained | FastMedia.Pro",
    description:
      "Who qualifies for the Czech Kreativni vouchery: eligible costs, the 85% support rate, the 150,000 CZK cap, de minimis limits, pre-financing and a step-by-step FAQ.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
    h1: "Eligibility rules: who qualifies for a creative voucher",
    contentBlocks: [
      "The Czech creative vouchers cover up to 85% of eligible bespoke creative work, capped at 150,000 CZK, and are reimbursed after the project is delivered and accounted for.",
      "Applicants must be active Czech businesses with no tax debts or insolvency, within the de minimis limit, working with a supplier listed in the national gallery of creatives. FastMedia.Pro is not the grant provider.",
    ],
  },
  {
    path: "/grant-application",
    title: "Creative Voucher Application Pack — Forms & Declarations | FastMedia",
    description:
      "Complete the Kreativni vouchery application pack: business details, project scope, 85/15 budget breakdown, de minimis and declarations. We return submission-ready documents.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.7",
    h1: "Creative Voucher application pack",
    contentBlocks: [
      "This page collects every detail a Czech creative voucher call normally requires: applicant identification and IČO, region of delivery, project description and measurable goals, creative deliverables, an 85/15 budget breakdown, de minimis history and the standard declarations.",
      "FastMedia.Pro is not the grant provider and does not decide applications. We prepare the technical specification, itemised supplier quotation and declarations checklist so the applicant can submit through their regional partner or the DPMK portal.",
    ],
  },
  {
    path: "/media-kit",
    title: "Media Kit — FastMedia.Pro Company and Portfolio",
    description:
      "The official FastMedia.Pro media kit: company bio, key facts, live website showcases for trades and services, and press contact information.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.6",
    h1: "FastMedia.Pro at a glance",
    contentBlocks: [
      "FastMedia.Pro is a digital studio designing and running modern, mobile-first, bilingual websites for tradespeople and small businesses in Czechia and worldwide, founded by a British entrepreneur.",
      "The media kit includes the company bio, key facts, selected live website showcases, project information and the press contact.",
    ],
  },
  {
    path: "/quote-request",
    title: "Request a Quote — FastMedia.Pro Web Design",
    description:
      "Tell us about your project and get a clear, itemised quote for a website, online shop or booking system. Reply within one working day.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/install",
    title: "Install the FastMedia app on your phone",
    description:
      "Add FastMedia.Pro to your home screen for instant access to demos, your dashboard and quotes — no app store needed.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.5",
    h1: "Install the FastMedia.Pro app",
    contentBlocks: [
      "Add FastMedia.Pro to your home screen using your browser’s installation option, where supported. On iPhone use Safari’s Share menu; on Android or desktop look for Install app in a compatible browser.",
      "An internet connection is required for pages and account tools. Installation does not guarantee offline access, instant loading or background updates; browser and device support vary.",
    ],
  },
  {
    path: "/consultant/tereza",
    title: "Tereza — Your dedicated FastMedia consultant",
    description:
      "Book a free consultation with Tereza to plan your website, pricing and launch timeline.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.6",
  },
];

const DEMO_TRADES = [
  "plumbing","electrical","building","roofing","drywall","wells","heating","solar","heatpumps",
  "painting","interior","exterior","gardening","cleaning","locksmith","carpentry","autorepair",
  "pestcontrol","photography","catering","fitness","beautysalon","moving","itservices","eshop",
  "womeninbusiness","virtualassistant","weddingplanner","florist","bakery","yoga","nailsalon",
  "massage","petgrooming","nutritionist","handmade","childcare","dental","realestate","accounting",
  "veterinary","tattoo","musicschool","drivingschool","laundry","security","translation",
];

const TRADE_LABELS: Record<string, string> = {
  plumbing: "Plumbing", electrical: "Electrical", building: "Construction & Building",
  roofing: "Roofing", drywall: "Drywall", wells: "Well Drilling", heating: "Heating",
  solar: "Solar Installation", heatpumps: "Heat Pumps", painting: "Painting & Decorating",
  interior: "Interior Design", exterior: "Exterior Works", gardening: "Gardening & Landscaping",
  cleaning: "Cleaning Services", locksmith: "Locksmith", carpentry: "Carpentry",
  autorepair: "Auto Repair", pestcontrol: "Pest Control", photography: "Photography",
  catering: "Catering", fitness: "Personal Training", beautysalon: "Beauty Salon",
  moving: "Removals & Moving", itservices: "IT Services", eshop: "E-commerce Store",
  womeninbusiness: "Women in Business", virtualassistant: "Virtual Assistant",
  weddingplanner: "Wedding Planning", florist: "Florist", bakery: "Bakery",
  yoga: "Yoga Studio", nailsalon: "Nail Salon", massage: "Massage Therapy",
  petgrooming: "Pet Grooming", nutritionist: "Nutritionist", handmade: "Handmade Goods",
  childcare: "Childcare", dental: "Dental Practice", realestate: "Real Estate",
  accounting: "Accounting", veterinary: "Veterinary", tattoo: "Tattoo Studio",
  musicschool: "Music School", drivingschool: "Driving School", laundry: "Laundry Service",
  security: "Security Services", translation: "Translation Services",
};

function demoRoute(trade: string): RouteSeo {
  const label = TRADE_LABELS[trade] ?? trade;
  const lower = label.toLowerCase();
  return {
    path: `/demo/${trade}`,
    title: `${label} Website Template — Live demo | FastMedia.Pro`,
    description: `Explore an illustrative ${lower} website template. Preview the layout and discuss booking, contact and optional features for your own business.`,
    ogImage: OG_IMG,
    ogType: "website",
    changefreq: "monthly",
    priority: "0.6",
    h1: `${label} website template — live demo`,
    contentBlocks: [
      `This is an illustrative ${lower} website template, not a verified customer website. Preview the layout, sample service information and enquiry journey; sample names, prices and reviews are not evidence of real business results.`,
      `Choose the pages and functions relevant to your business. Booking, chat, payments and CRM connections depend on the agreed scope and configuration; prototype controls do not establish a live integration.`,
      `Use Get Quote to discuss this template in the calculator or contact FastMedia.Pro. Final content, delivery, hosting and optional features are agreed before work begins; search rankings, bookings and sales are not guaranteed.`,
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${label} Website Template`,
      provider: { "@type": "Organization", name: BRAND },
      areaServed: "Worldwide",
      description: `Conversion-optimised ${lower} website template by FastMedia.Pro.`,
    },
  };
}

function featureRoute(id: string): RouteSeo | null {
  const feat = calculatorFeatures.find((f) => f.id === id);
  const detail = getFeatureDetail(id);
  if (!feat || !detail) return null;
  const name = feat.nameEn;
  const desc = feat.descEn;
  const details = detail.detailsEn;
  const shortDesc = `${desc}. ${details.split(".")[0]}.`.slice(0, 158);
  const benefits = detail.benefitsEn.slice(0, 4);
  const firstFaq = detail.faqEn[0];
  return {
    path: `/feature/${id}`,
    title: `${name} — Website feature | FastMedia.Pro`,
    description: shortDesc,
    ogImage: detail.heroImage ?? OG_IMG,
    ogType: "website",
    changefreq: "monthly",
    priority: "0.5",
    h1: `${name} for your website`,
    contentBlocks: [
      details,
      `Key benefits: ${benefits.join("; ")}.`,
      firstFaq
        ? `${firstFaq.q} ${firstFaq.a}`
        : `Add ${name.toLowerCase()} to your project through the FastMedia.Pro AI website calculator — you'll see a live one-off price and, where relevant, a monthly cost before you commit.`,
      `Pricing starts at ${feat.oneTimePrice.toLocaleString("en-GB")} CZK one-off${feat.monthlyPrice ? ` plus ${feat.monthlyPrice.toLocaleString("en-GB")} CZK per month` : ""}, delivered by FastMedia.Pro in about ${feat.laborHours} hours of build time. Open the calculator to add this feature to your quote, or contact our team at support@fastmedia.pro or +420 797 864 432 to discuss custom requirements.`,
    ],
    jsonLd: {
      "@context": "https://schema.org",
      // A website feature is a build service, not a merchant product (avoids merchant-listing errors).
      "@type": "Service",
      name,
      description: desc,
      provider: { "@type": "ProfessionalService", name: BRAND, url: "https://www.fastmedia.pro/" },
      offers: {
        "@type": "Offer",
        price: feat.oneTimePrice,
        priceCurrency: "CZK",
        url: `https://www.fastmedia.pro/feature/${id}`,
      },
    },
  };
}

export async function getAllRoutes(): Promise<RouteSeo[]> {
  const featureRoutes = calculatorFeatures
    .map((f) => featureRoute(f.id))
    .filter((r): r is RouteSeo => r !== null);

  const serviceRoutes: RouteSeo[] = serviceLandings.map((s) => ({
    path: `/service/${s.slug}`,
    title: s.seoTitle,
    description: s.seoDescription,
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
    h1: s.en.headline,
    contentBlocks: [
      s.en.intro,
      `What you get: ${s.en.benefits.join("; ")}.`,
      `What's included: ${s.en.deliverables.join("; ")}.`,
      `${s.en.outcome} Talk to FastMedia.Pro at support@fastmedia.pro or +420 797 864 432, or send an enquiry from this page.`,
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.en.name,
      description: s.seoDescription,
      provider: { "@type": "Organization", name: BRAND },
      areaServed: "Worldwide",
      url: `https://www.fastmedia.pro/service/${s.slug}`,
    },
  }));

  const industryRoutes: RouteSeo[] = industryLandings.map((i) => ({
    path: `/websites-for/${i.slug}`,
    title: i.seoTitle,
    description: i.seoDescription,
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
    h1: i.en.headline,
    contentBlocks: [i.en.intro, `Features: ${i.en.features.join("; ")}.`, ...i.en.faq.map((f) => `${f.q} ${f.a}`)],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: i.en.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  }));

  const routes: RouteSeo[] = [
    ...STATIC_ROUTES,
    ...serviceRoutes,
    ...industryRoutes,
    ...DEMO_TRADES.map(demoRoute),
    ...featureRoutes,
    ...blogPosts.map(post => ({
      path: `/blog/${post.slug}`, title: `${post.title.cs} | FastMedia.Pro`,
      description: post.excerpt.cs, h1: post.title.cs, language: 'cs-CZ',
      ogType: 'article' as const, ogImage: OG_IMG,
      contentBlocks: [post.excerpt.cs, ...post.sections.flatMap(section =>
        section.type === 'paragraph' || section.type === 'heading' || section.type === 'callout'
          ? [section.text.cs] : section.type === 'list' ? section.items.map(item => item.cs) : [])],
      jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: post.title.cs,
        datePublished: post.date, author: { '@type': 'Person', name: post.author },
        url: `https://www.fastmedia.pro/blog/${post.slug}`, publisher: orgJsonLd },
    })),
  ];

  // Dynamic content from Supabase (best-effort; failures don't break the build)
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (url && anon) {
    try {
      const supabase = createClient(url, anon);
      const posts = await safeSeoFetch('articles', () => supabase
        .from("blog_posts")
        .select("slug, title, excerpt, content, author, published_at, hero_image_url")
        .eq("status", "published"));
      if (posts) {
        for (const p of posts) {
          const picked = pickSeoText(p.title);
          const title = picked.text;
          const excerpt = pickSeoText(p.excerpt, picked.key).text;
          const content = p.content as Record<string, { sections?: Array<{ type?: string; text?: string }> } | undefined> | null;
          const sections = content?.[picked.key]?.sections?.length ? content[picked.key]!.sections! : (content?.cs?.sections ?? content?.en?.sections ?? []);
          const paragraphs = sections.filter(b => b.type === 'paragraph' || b.type === 'heading').map(b => b.text ?? '').filter(Boolean);
          if (!title) continue;
          routes.push({
            path: `/blog/${p.slug}`,
            title: `${title} | FastMedia.Pro`,
            h1: title, language: picked.language, contentBlocks: [excerpt, ...paragraphs],
            description: excerpt.slice(0, 160) || `Read "${title}" on the FastMedia.Pro blog.`,
            ogImage: p.hero_image_url ?? OG_IMG,
            ogType: "article",
            // Publication date is not necessarily the last significant edit.
            lastmod: undefined,
            changefreq: "monthly",
            priority: "0.6",
            jsonLd: {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: title,
              author: { "@type": "Person", name: p.author || "FastMedia.Pro" },
              url: `https://www.fastmedia.pro/blog/${p.slug}`,
              datePublished: p.published_at,
              publisher: orgJsonLd,
            },
          });
        }
      }

      const courses = await safeSeoFetch('courses', () => supabase.from('courses').select('slug,title_cs,subtitle_cs,intro_cs,learn_cs').eq('is_published', true));
      for (const c of courses) {
        if (!c.slug || !c.title_cs) continue;
        const intro = (c.intro_cs ?? '').replace(/<[^>]*>/g, ' ');
        routes.push({ path: `/courses/${c.slug}`, title: `${c.title_cs} | FastMedia.Pro`, description: c.subtitle_cs || intro.slice(0, 160) || c.title_cs, h1: c.title_cs, contentBlocks: [intro, ...(c.learn_cs ?? [])], language: 'cs-CZ', ogImage: OG_IMG });
      }
      const languageVersions = await safeSeoFetch('translations', () => supabase.from('language_versions')
        .select('language_code,slug,source_path,title,meta_description,content').eq('status', 'published'));
      for (const row of languageVersions ?? []) {
        const content = row.content as { h1?: string; intro?: string; sections?: Array<{ heading?: string; paragraphs?: string[]; bullets?: string[] }> } | null;
        if (!row.title || !content?.h1 || !content.intro) continue;
        const alternates = languageAlternatives(languageVersions, row.source_path);
        if (!alternates.some(a => a.path === `/l/${row.language_code}/${row.slug}`)) continue;
        routes.push({ path: `/l/${row.language_code}/${row.slug}`, title: row.title, description: row.meta_description || content?.intro || row.title,
          h1: content?.h1 || row.title, language: row.language_code, alternates, ogImage: OG_IMG,
          contentBlocks: [content?.intro ?? '', ...(content?.sections ?? []).flatMap(s => [s.heading ?? '', ...(s.paragraphs ?? []), ...(s.bullets ?? [])])].filter(Boolean) });
      }
      const demos = await safeSeoFetch('demos', () => supabase.from('custom_demos').select('trade_id,name,description').eq('is_active', true));
      for (const demo of demos ?? []) {
        if (routes.some(r => r.path === `/demo/${demo.trade_id}`)) continue;
        const name = demo.name as Record<string, string>;
        const description = demo.description as Record<string, string>;
        routes.push({ path: `/demo/${demo.trade_id}`, title: `${name.cs || name.en} — demo | FastMedia.Pro`,
          description: description.cs || description.en, contentBlocks: [description.cs || description.en, 'Ilustrativní demo — ne skutečný zákaznický web. Funkce a propojení se dohodnou podle vašeho projektu.'], language: 'cs-CZ', ogImage: OG_IMG });
      }
      const legal = await safeSeoFetch('legal documents', () => supabase
        .from("legal_documents")
        .select("slug, title, summary, region")
        .eq('published', true));
      if (legal) {
        const rank = (region: string) => region === 'eu' ? 0 : region === 'global' ? 1 : 2;
        const preferred = [...legal].sort((a, b) => rank(a.region) - rank(b.region));
        const seen = new Set<string>();
        for (const l of preferred) {
          if (seen.has(l.slug)) continue;
          if (!l.slug || !l.title) continue;
          seen.add(l.slug);
          routes.push({
            path: `/legal/${l.slug}`,
            title: `${l.title} | FastMedia.Pro`,
            description: (l.summary ?? `${l.title} — legal document.`).slice(0, 160),
            ogImage: OG_IMG,
            changefreq: "yearly",
            priority: "0.3",
          });
        }
      }
    } catch (err) {
      console.warn("[seo-routes] dynamic route fetch failed:", err);
    }
  }

  for (const [base, versions] of Object.entries(publicSeo)) {
    const alternates = (['cs', 'en', 'de'] as const).map(language => ({ language: languageLocales[language], path: `/${language}${base}` }));
    alternates.push({ language: 'x-default', path: `/cs${base}` });
    for (const language of ['cs', 'en', 'de'] as const) {
      const content = versions[language];
      routes.push({ path: `/${language}${base}`, title: content.title, description: content.description, h1: content.title.split('|')[0].trim(), contentBlocks: content.content, language: languageLocales[language], alternates, ogImage: OG_IMG, changefreq: 'monthly', priority: '0.7' });
    }
    const original = routes.find(route => route.path === base);
    if (original) Object.assign(original, { title: versions.cs.title, description: versions.cs.description, h1: versions.cs.title.split('|')[0].trim(), contentBlocks: versions.cs.content, language: 'cs-CZ', alternates });
  }

  // Guard: drop any malformed entry so prerendering can never crash on it
  return [...new Map(routes.filter(
    (r): r is RouteSeo =>
      !!r &&
      typeof r.path === "string" &&
      isIndexablePath(r.path) &&
      !r.path.includes("undefined") &&
      typeof r.title === "string" &&
      typeof r.description === "string",
  ).map(route => [route.path, route])).values()];
}

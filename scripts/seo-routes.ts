// Single source of truth for routes the prerender script writes per-page HTML for.
// Dynamic routes (blog articles, legal docs, custom demos) are fetched at
// build time via the anon Supabase key.

import { createClient } from "@supabase/supabase-js";
import { calculatorFeatures } from "../src/data/calculatorFeatures.ts";
import { getFeatureDetail } from "../src/data/featureDetails.ts";
import { serviceLandings } from "../src/data/serviceLandings.ts";

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
}

const BRAND = "FastMedia.Pro";
const OG_IMG = "https://www.fastmedia.pro/pwa-512x512.png";

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
    path: "/",
    title: "FastMedia.Pro — Websites for Trades & Services",
    description:
      "FastMedia.Pro builds high-converting websites for tradespeople and service businesses. AI chatbot, online booking, lead capture. 47 templates, live in 10 days.",
    ogImage: OG_IMG,
    changefreq: "weekly",
    priority: "1.0",
    jsonLd: orgJsonLd,
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
      "Practical SEO, branding and marketing guides for tradespeople and service businesses. Updated weekly with case studies and trends.",
    ogImage: OG_IMG,
    changefreq: "daily",
    priority: "0.8",
  },
  {
    path: "/calculator",
    title: "AI Website Calculator — Live quote in 2 minutes | FastMedia.Pro",
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
      "Case studies from FastMedia.Pro website projects: enquiry growth, booking numbers, basket values and mobile load times. Each study opens and downloads as a PDF.",
    ogImage: OG_IMG,
    changefreq: "weekly",
    priority: "0.8",
    h1: "Case studies: website projects and the results that followed",
    contentBlocks: [
      "Each case study covers one project: the business problem, what was built, and the measured outcome - enquiry volume, response time, out-of-hours bookings, basket value and mobile load time.",
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
    title: "Media Kit — FastMedia.Pro Company Bio, Portfolio & Testimonials",
    description:
      "The official FastMedia.Pro media kit: company bio, key facts, live website showcases for trades and services, and testimonials from Czech business owners.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.6",
    h1: "FastMedia.Pro at a glance",
    contentBlocks: [
      "FastMedia.Pro is a digital studio designing and running modern, mobile-first, bilingual websites for tradespeople and small businesses in Czechia and worldwide, founded by a British entrepreneur.",
      "The media kit includes the company bio, key facts, selected live website showcases, client testimonials and the press contact.",
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
      "FastMedia.Pro works as a Progressive Web App (PWA), which means you can install it on your iPhone, iPad, Android phone or desktop computer straight from the browser — no App Store or Play Store account required. Once installed, the app launches from your home screen in its own window, loads instantly thanks to service-worker caching, and continues to work when your connection drops.",
      "On iPhone or iPad, open this page in Safari, tap the Share icon (a square with an upward arrow) in the bottom toolbar, scroll down and choose 'Add to Home Screen', then tap 'Add' to confirm. On Android, open the page in Chrome, tap the three-dot menu and select 'Install app' or 'Add to Home screen'. On Windows or macOS, open the site in Chrome, Edge or Brave and click the small install icon at the right edge of the address bar, then confirm to place a desktop shortcut and dock icon.",
      "The installed app gives you offline access to your saved demos, quotes and dashboards, one-tap access to the AI website calculator, faster page loads because the app shell is served from your device, and a proper native-feeling icon on your home screen. It weighs less than a megabyte, uses no background data, and updates itself silently in the background whenever we release improvements — so you never have to reinstall.",
      "If installation is not available on your device, you can still bookmark this page and pin it to your home screen; every feature of the site works in a regular browser tab. For help or questions about installing FastMedia.Pro, email support@fastmedia.pro or call +420 797 864 432 and our team will walk you through the exact steps for your phone model.",
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
    description: `Explore a fully built ${lower} website template with AI chat, booking and lead capture. Get yours live in 10 days.`,
    ogImage: OG_IMG,
    ogType: "website",
    changefreq: "monthly",
    priority: "0.6",
    h1: `${label} website template — live demo`,
    contentBlocks: [
      `This is a fully working ${lower} website template built by FastMedia.Pro. It includes a mobile-optimised hero, a services section tailored to ${lower} businesses, a project or treatment gallery, transparent pricing, a live booking calendar, an AI chat assistant that answers customer questions around the clock, and a lead-capture form that emails and text-messages every enquiry straight to your phone.`,
      `The template is designed for independent ${lower} professionals and small teams who want a modern website that ranks well on Google, loads in under two seconds, and turns visitors into paying customers. Every section — copy, colours, images, prices, service list — is editable through a simple back-office dashboard, so you can launch quickly and refine as you grow. GDPR, cookie consent, an XML sitemap and structured schema markup are configured out of the box.`,
      `You can preview the full ${lower} demo above, then click Get Quote to open the AI website calculator with the ${lower} industry pre-selected. Add or remove the features you need — booking, e-commerce, multilingual content, live chat, video, CRM — and see a live price and timeline before you commit. Typical delivery is ten working days from signed brief to launch, with hosting, security, backups and ongoing SEO monitoring included.`,
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
      "@type": "Product",
      name,
      description: desc,
      brand: { "@type": "Brand", name: BRAND },
      offers: {
        "@type": "Offer",
        price: feat.oneTimePrice,
        priceCurrency: "CZK",
        availability: "https://schema.org/InStock",
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

  const routes: RouteSeo[] = [
    ...STATIC_ROUTES,
    ...serviceRoutes,
    ...DEMO_TRADES.map(demoRoute),
    ...featureRoutes,
  ];

  // Dynamic content from Supabase (best-effort; failures don't break the build)
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (url && anon) {
    try {
      const supabase = createClient(url, anon);
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, published_at, og_image_url")
        .eq("status", "published");
      if (posts) {
        for (const p of posts) {
          routes.push({
            path: `/blog/${p.slug}`,
            title: `${p.title} | FastMedia Blog`,
            description: (p.excerpt ?? "").slice(0, 160) || `Read "${p.title}" on the FastMedia.Pro blog.`,
            ogImage: p.og_image_url ?? OG_IMG,
            ogType: "article",
            lastmod: p.published_at ?? undefined,
            changefreq: "monthly",
            priority: "0.6",
            jsonLd: {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: p.title,
              datePublished: p.published_at,
              publisher: orgJsonLd,
            },
          });
        }
      }

      const { data: legal } = await supabase
        .from("legal_documents")
        .select("slug, title, summary");
      if (legal) {
        for (const l of legal) {
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

  // Guard: drop any malformed entry so prerendering can never crash on it
  return routes.filter(
    (r): r is RouteSeo =>
      !!r &&
      typeof r.path === "string" &&
      r.path.startsWith("/") &&
      !r.path.includes("undefined") &&
      typeof r.title === "string" &&
      typeof r.description === "string",
  );
}

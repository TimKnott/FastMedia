// Single source of truth for routes the prerender script writes per-page HTML for.
// Dynamic routes (blog articles, legal docs, custom demos) are fetched at
// build time via the anon Supabase key.

import { createClient } from "@supabase/supabase-js";
import { calculatorFeatures } from "../src/data/calculatorFeatures.ts";
import { getFeatureDetail } from "../src/data/featureDetails.ts";

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

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND,
  url: "https://www.fastmedia.pro",
  logo: "https://www.fastmedia.pro/favicon.jpeg",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+420797864432",
    email: "support@fastmedia.pro",
    contactType: "sales",
    availableLanguage: ["en"],
  },
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
    path: "/contact",
    title: "Contact FastMedia.Pro — Talk to Our Web Team",
    description:
      "Get in touch about a new website, redesign or ongoing support. Message, call or WhatsApp us — we reply within one working day.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.8",
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

  const routes: RouteSeo[] = [
    ...STATIC_ROUTES,
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

  return routes;
}

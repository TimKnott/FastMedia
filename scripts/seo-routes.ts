// Single source of truth for routes the prerender script writes per-page HTML for.
// Dynamic routes (blog articles, legal docs, custom demos) are fetched at
// build time via the anon Supabase key.

import { createClient } from "@supabase/supabase-js";

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
    path: "/install",
    title: "Install the FastMedia app on your phone",
    description:
      "Add FastMedia.Pro to your home screen for instant access to demos, your dashboard and quotes — no app store needed.",
    ogImage: OG_IMG,
    changefreq: "monthly",
    priority: "0.5",
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
  return {
    path: `/demo/${trade}`,
    title: `${label} Website Template — Live demo | FastMedia.Pro`,
    description: `Explore a fully built ${label.toLowerCase()} website template with AI chat, booking and lead capture. Get yours live in 10 days.`,
    ogImage: OG_IMG,
    ogType: "website",
    changefreq: "monthly",
    priority: "0.6",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${label} Website Template`,
      provider: { "@type": "Organization", name: BRAND },
      areaServed: "Worldwide",
      description: `Conversion-optimised ${label.toLowerCase()} website template by FastMedia.Pro.`,
    },
  };
}

export async function getAllRoutes(): Promise<RouteSeo[]> {
  const routes: RouteSeo[] = [...STATIC_ROUTES, ...DEMO_TRADES.map(demoRoute)];

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

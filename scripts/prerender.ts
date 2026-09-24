// Build-time prerender: writes one dist/<route>/index.html per route with
// per-route <title>, description, canonical, og:*, twitter:*, and JSON-LD
// baked into the raw HTML. This is what SiteGuru / non-JS crawlers see.
//
// Wired as `postbuild` in package.json.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { getAllRoutes, type RouteSeo } from "./seo-routes.ts";

const BASE_URL = "https://www.fastmedia.pro";
const DIST = resolve("dist");
const TEMPLATE_PATH = join(DIST, "index.html");

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHead(route: RouteSeo): string {
  const url = `${BASE_URL}${route.path === "/" ? "/" : route.path.replace(/\/+$/, "")}`;
  const canonical = route.path === "/" ? `${BASE_URL}/` : url;
  const ogType = route.ogType ?? "website";
  const ogImage = route.ogImage ?? `${BASE_URL}/pwa-512x512.png`;
  const lines = [
    `<title>${escText(route.title)}</title>`,
    `<meta name="description" content="${escAttr(route.description)}" />`,
    `<link rel="canonical" href="${escAttr(canonical)}" />`,
    `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
    `<meta property="og:title" content="${escAttr(route.title)}" />`,
    `<meta property="og:description" content="${escAttr(route.description)}" />`,
    `<meta property="og:url" content="${escAttr(canonical)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:site_name" content="FastMedia.Pro" />`,
    `<meta property="og:image" content="${escAttr(ogImage)}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escAttr(route.title)}" />`,
    `<meta name="twitter:description" content="${escAttr(route.description)}" />`,
    `<meta name="twitter:image" content="${escAttr(ogImage)}" />`,
    `<link rel="alternate" hreflang="en-GB" href="${escAttr(canonical)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escAttr(canonical)}" />`,
  ];
  if (route.jsonLd) {
    const items = Array.isArray(route.jsonLd) ? route.jsonLd : [route.jsonLd];
    for (const item of items) {
      lines.push(`<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`);
    }
  }
  return lines.join("\n    ");
}

function buildCrawlBody(route: RouteSeo, allRoutes: RouteSeo[]): string {
  // Visible-to-crawler content block: real H1, route-specific paragraphs,
  // image with alt, and internal links. Rendered as a normal <main> so
  // SEO auditors (SiteGuru, SmatLeads) and non-JS crawlers extract the
  // words. React hydration removes the block on paint so real users
  // never see it — the SPA takes over immediately.
  const topLinks = allRoutes
    .filter((r) => r && typeof r.path === "string" && typeof r.title === "string" && typeof r.description === "string")
    .filter((r) => r.path !== route.path && (r.path === "/" || r.path.startsWith("/demo/") || r.path === "/blog" || r.path === "/calculator" || r.path === "/inquiry"))
    .slice(0, 16)
    .map((r) => {
      const label = escText(r.title.split("—")[0].split("|")[0].trim());
      const title = escAttr(r.description.slice(0, 120));
      return `<a href="${escAttr(r.path)}" title="${title}">${label}</a>`;
    })
    .join(" · ");

  const headline = escText(route.h1 ?? route.title);
  const summary = escText(route.description);

  // Route-specific copy when provided; otherwise a rich sitewide fallback.
  const paragraphs = (route.contentBlocks && route.contentBlocks.length > 0)
    ? route.contentBlocks.map((p) => `<p>${escText(p)}</p>`).join("\n    ")
    : `
    <p>FastMedia.Pro designs and builds professional, conversion-focused websites
    for tradespeople, home-service providers and small service businesses across
    the UK, Ireland and mainland Europe. Every website ships with a modern,
    mobile-first design, an AI chatbot that answers customer questions 24 hours
    a day, an online booking system and a lead capture engine that instantly
    emails and text-messages new enquiries to your phone.</p>
    <p>Our library of 47 industry templates covers plumbing, electrical work,
    roofing, construction, heating and heat pumps, solar installation,
    painting and decorating, gardening and landscaping, cleaning, locksmiths,
    carpentry, auto repair, pest control, photography, catering, personal
    training, beauty salons, removals, IT services, e-commerce, wedding
    planning, florists, bakeries, yoga, nail salons, massage therapy, pet
    grooming, childcare, dental practices, real estate, accounting, veterinary
    clinics, tattoo studios, music schools, driving schools, laundry services,
    security firms and translation agencies. Each template is fully editable,
    search-engine optimised, GDPR compliant and delivered in about ten days.</p>
    <p>Every FastMedia.Pro website includes structured schema markup, fast
    hosting on a global CDN, automatic HTTPS, image optimisation, Core Web
    Vitals tuning, an XML sitemap, a robots.txt file and continuous SEO
    monitoring. We also plug in our 24/7 AI Lead Assistant that follows up
    on every enquiry within seconds — so 92% of local business leads that
    would normally be lost to slow reply times stay in your pipeline. Pricing
    starts at €297 per month with no upfront build cost, and you can scope
    your project in two minutes with our interactive AI website calculator or
    request a tailored proposal from our team.</p>
    <p>Explore a live industry demo, read our blog for practical marketing
    and SEO advice, or start a project below.</p>
  `;

  const heroImgSrc = (route as { ogImage?: string }).ogImage ?? "https://www.fastmedia.pro/pwa-512x512.png";
  const heroImg = `<img src="${escAttr(heroImgSrc)}" alt="${escAttr(route.h1 ?? route.title)}" width="1200" height="630" loading="lazy" decoding="async" />`;

  return `
<div data-prerender="splash" style="position:fixed;inset:0;background:#0b1220;display:flex;align-items:center;justify-content:center;z-index:2147483647;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
  <div style="text-align:center;">
    <img src="https://www.fastmedia.pro/pwa-192x192.png" alt="" width="72" height="72" style="border-radius:16px;margin:0 auto 16px;display:block;box-shadow:0 10px 30px rgba(0,0,0,.4);" />
    <div style="font-size:14px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">FastMedia.Pro</div>
    <div style="margin-top:14px;width:120px;height:2px;background:linear-gradient(90deg,transparent,#38bdf8,transparent);animation:fmPulse 1.4s ease-in-out infinite;"></div>
  </div>
  <style>@keyframes fmPulse{0%,100%{opacity:.25}50%{opacity:1}}</style>
</div>
<main data-prerender="fallback" aria-hidden="true" style="position:absolute;left:0;top:0;width:100%;max-width:960px;padding:32px 24px;box-sizing:border-box;color:#0f172a;background:#ffffff;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.55;">
  <h1 style="font-size:28px;margin:0 0 12px;">${headline}</h1>
  <p><strong>${summary}</strong></p>
  ${heroImg}
  ${paragraphs}
  <nav aria-label="Site links">${topLinks}</nav>
  <p>Contact FastMedia.Pro: <a href="mailto:support@fastmedia.pro" title="Email FastMedia.Pro support">support@fastmedia.pro</a> · <a href="tel:+420797864432" title="Call FastMedia.Pro sales">+420 797 864 432</a></p>
</main>
<script>
  // Remove the prerender fallback + splash the instant React hydrates so
  // real users never see the raw SEO content. Non-JS crawlers keep the
  // fallback content in the raw HTML.
  (function(){
    var strip = function(){
      var nodes = document.querySelectorAll('[data-prerender="fallback"],[data-prerender="splash"]');
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n && n.parentNode) n.parentNode.removeChild(n);
      }
    };
    var root = document.getElementById('root');
    if (root && 'MutationObserver' in window) {
      var mo = new MutationObserver(function(){
        if (root.childElementCount > 0) { mo.disconnect(); strip(); }
      });
      mo.observe(root, { childList: true });
      setTimeout(function(){ mo.disconnect(); strip(); }, 4000);
    } else {
      setTimeout(strip, 1500);
    }
  })();
</script>`;
}

function applyToTemplate(template: string, headInjection: string, bodyInjection: string): string {
  // Strip any existing canonical/title/description/og/twitter/jsonld/alternate tags from the static head.
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["'](description|robots|twitter:[^"']*)["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:[^"']*["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']alternate["'][^>]*hreflang=[^>]*>/gi, "")
    .replace(/<script[^>]+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, "");
  // Inject our head block just before </head>
  html = html.replace(/<\/head>/i, `    ${headInjection}\n  </head>`);
  // Inject crawl content after #root so the SPA mounts cleanly above it.
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root"></div>${bodyInjection}`);
  return html;
}


function writeRouteFile(route: RouteSeo, html: string) {
  const dest =
    route.path === "/"
      ? join(DIST, "index.html")
      : join(DIST, route.path.replace(/^\/+/, ""), "index.html");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
}

function build404(template: string): string {
  const head = [
    `<title>Page not found (404) | FastMedia.Pro</title>`,
    `<meta name="description" content="The page you are looking for does not exist." />`,
    `<meta name="robots" content="noindex, nofollow" />`,
    `<meta name="prerender-status-code" content="404" />`,
    `<meta http-equiv="Status" content="404 Not Found" />`,
    `<link rel="canonical" href="${BASE_URL}/404" />`,
  ].join("\n    ");
  return applyToTemplate(template, head, "");
}

async function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    console.warn(`[prerender] ${TEMPLATE_PATH} not found. Did vite build run?`);
    return;
  }
  const template = readFileSync(TEMPLATE_PATH, "utf8");
  const allRoutes = await getAllRoutes();
  const routes = allRoutes.filter(
    (r) => r && typeof r.path === "string" && r.path.startsWith("/") && typeof r.title === "string" && typeof r.description === "string",
  );
  if (routes.length !== allRoutes.length) {
    console.warn(`[prerender] skipped ${allRoutes.length - routes.length} malformed route entries`);
  }
  console.log(`[prerender] generating ${routes.length} routes`);

  // Approved (published) schema blocks from the AI Search Visibility workspace.
  // Never fails the build: if the backend is unreachable, pages build without them.
  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/geo_schema_blocks?status=eq.published&select=page_path,json_ld`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const blocks = (await res.json()) as { page_path: string; json_ld: unknown }[];
        for (const b of blocks) {
          const r = routes.find((x) => x.path === b.page_path);
          if (!r) continue;
          const existing = r.jsonLd ? (Array.isArray(r.jsonLd) ? r.jsonLd : [r.jsonLd]) : [];
          (r as { jsonLd?: unknown }).jsonLd = [...existing, b.json_ld];
        }
        console.log(`[prerender] added ${blocks.length} published schema blocks`);
      }
    }
  } catch (e) {
    console.warn("[prerender] schema blocks unavailable:", (e as Error).message);
  }

  for (const route of routes) {
    const head = buildHead(route);
    const body = buildCrawlBody(route, routes);
    const html = applyToTemplate(template, head, body);
    writeRouteFile(route, html);
  }

  // 404
  writeFileSync(join(DIST, "404.html"), build404(template));

  console.log(`[prerender] done. Wrote ${routes.length} route files + 404.html`);
}

main().catch((err) => {
  console.error("[prerender] FAILED:", err);
  process.exit(1);
});

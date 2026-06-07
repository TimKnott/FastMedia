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
    `<h1 hidden data-prerender>${escText(route.title)}</h1>`.replace(/<h1[^>]*>/, '<meta name="prerender-h1" content="') + '" />',
  ];
  if (route.jsonLd) {
    const items = Array.isArray(route.jsonLd) ? route.jsonLd : [route.jsonLd];
    for (const item of items) {
      lines.push(`<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`);
    }
  }
  return lines.join("\n    ");
}

function buildHiddenH1AndLinks(route: RouteSeo, allRoutes: RouteSeo[]): string {
  // Crawler-visible H1 + internal-link block injected after <div id="root"></div>.
  // Hidden from humans (display:none), present in raw HTML for SiteGuru/Googlebot.
  const topLinks = allRoutes
    .filter((r) => r.path !== route.path && (r.path === "/" || r.path.startsWith("/demo/") || r.path === "/blog" || r.path === "/calculator" || r.path === "/inquiry"))
    .slice(0, 12)
    .map((r) => `<a href="${escAttr(r.path)}">${escText(r.title.split("—")[0].split("|")[0].trim())}</a>`)
    .join(" · ");
  return `
<div data-prerender="crawl-only" style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden">
  <h1>${escText(route.title)}</h1>
  <p>${escText(route.description)}</p>
  <nav aria-label="Site links">${topLinks}</nav>
</div>`;
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
  // Inject crawl-only content after #root
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
  const routes = await getAllRoutes();
  console.log(`[prerender] generating ${routes.length} routes`);

  for (const route of routes) {
    const head = buildHead(route);
    const body = buildHiddenH1AndLinks(route, routes);
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

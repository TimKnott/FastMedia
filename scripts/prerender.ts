// Build-time prerender: writes one dist/<route>/index.html per route with
// per-route <title>, description, canonical, og:*, twitter:*, and JSON-LD
// baked into the raw HTML. This is what SiteGuru / non-JS crawlers see.
//
// Runs after Vite in package.json's build command.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from 'node:url';
import { getAllRoutes, type RouteSeo } from "./seo-routes.ts";
import { buildCrawlBody, applyToTemplate, canonicalPath, breadcrumbSchema, isIndexablePath } from "./seo-html.ts";

const BASE_URL = "https://www.fastmedia.pro";
const DIST = resolve("dist");
const TEMPLATE_PATH = join(DIST, "index.html");

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildHead(route: RouteSeo): string {
  const url = `${BASE_URL}${route.path === "/" ? "/" : canonicalPath(route.path)}`;
  const canonical = route.path === "/" ? `${BASE_URL}/` : url;
  const ogType = route.ogType ?? "website";
  const ogImage = route.ogImage ?? `${BASE_URL}/og-image.jpg`;
  const lines = [
    `<title data-rh="true">${escText(route.title)}</title>`,
    `<meta data-rh="true" name="description" content="${escAttr(route.description)}" />`,
    `<link data-rh="true" rel="canonical" href="${escAttr(canonical)}" />`,
    `<meta data-rh="true" name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
    `<meta data-rh="true" property="og:title" content="${escAttr(route.title)}" />`,
    `<meta data-rh="true" property="og:description" content="${escAttr(route.description)}" />`,
    `<meta data-rh="true" property="og:url" content="${escAttr(canonical)}" />`,
    `<meta data-rh="true" property="og:type" content="${ogType}" />`,
    `<meta data-rh="true" property="og:site_name" content="FastMedia.Pro" />`,
    `<meta data-rh="true" property="og:image" content="${escAttr(ogImage)}" />`,
    `<meta data-rh="true" property="og:locale" content="${route.language?.replace('-', '_') ?? 'en_GB'}" />`,
    `<meta data-rh="true" name="twitter:card" content="summary_large_image" />`,
    `<meta data-rh="true" name="twitter:title" content="${escAttr(route.title)}" />`,
    `<meta data-rh="true" name="twitter:description" content="${escAttr(route.description)}" />`,
    `<meta data-rh="true" name="twitter:image" content="${escAttr(ogImage)}" />`,
    ...(route.alternates ?? []).map(alternate => `<link data-rh="true" rel="alternate" hreflang="${escAttr(alternate.language)}" href="${BASE_URL}${escAttr(alternate.path)}" />`),
  ];
  if (route.path !== "/") lines.push(`<script data-seo-static type="application/ld+json">${JSON.stringify(breadcrumbSchema(route)).replace(/</g, "\\u003c")}</script>`);
  if (route.jsonLd) {
    const items = Array.isArray(route.jsonLd) ? route.jsonLd : [route.jsonLd];
    for (const item of items) {
      lines.push(`<script data-seo-static type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`);
    }
  }
  return lines.join("\n    ");
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
    `<meta data-rh="true" name="description" content="The page you are looking for does not exist." />`,
    `<meta data-rh="true" name="robots" content="noindex, nofollow" />`,
    `<meta data-rh="true" name="prerender-status-code" content="404" />`,
    `<meta http-equiv="Status" content="404 Not Found" />`,
    `<link data-rh="true" rel="canonical" href="${BASE_URL}/404" />`,
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
    const html = applyToTemplate(template, head, body).replace(/<html\b[^>]*>/i, `<html lang="${route.language ?? 'en-GB'}">`);
    writeRouteFile(route, html);
  }

  // Supplemental sitemap uses the existing prerender mechanism; the primary static sitemap is retained.
  const entries = routes.filter(r => isIndexablePath(r.path) && canonicalPath(r.path) === r.path);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(r => `<url><loc>${BASE_URL}${escText(r.path)}</loc>${r.lastmod && !Number.isNaN(Date.parse(r.lastmod)) ? `<lastmod>${escText(r.lastmod)}</lastmod>` : ""}</url>`).join("\n")}</urlset>`;
  writeFileSync(join(DIST, "sitemap-content.xml"), sitemap);

  // 404
  writeFileSync(join(DIST, "404.html"), build404(template));

  console.log(`[prerender] done. Wrote ${routes.length} route files + 404.html`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((err) => {
  console.error("[prerender] FAILED:", err);
  process.exit(1);
});

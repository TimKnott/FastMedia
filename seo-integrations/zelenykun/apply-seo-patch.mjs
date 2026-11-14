// Apply the source-reviewed Zelený Kůň SEO patch to a local checkout.
// This does not call Lovable AI or modify a hosted project by itself.
// Usage: node seo-integrations/zelenykun/apply-seo-patch.mjs /path/to/zelenykun
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] || ".");
const homeFile = join(root, "src/routes/index.tsx");
if (!existsSync(homeFile)) throw new Error("Zelený Kůň homepage route not found: " + homeFile);
const original = readFileSync(homeFile, "utf8");
const siteFile = join(root, "src/components/site.tsx");
if (!existsSync(siteFile)) throw new Error("Zelený Kůň pricing source not found: " + siteFile);
const siteSource = readFileSync(siteFile, "utf8");
const price = Number(siteSource.match(/export const PRICE\s*=\s*(\d+(?:\.\d+)?)\s*;/)?.[1]);
const minimum = Number(siteSource.match(/export const MIN_CZK\s*=\s*(\d+(?:\.\d+)?)\s*;/)?.[1]);
if (price !== 25 || minimum !== 200) {
  throw new Error("Pricing changed from the reviewed 25 CZK/kg and 200 CZK minimum; review Product/Offer schema before publishing");
}

const importLine = 'import { fodderProductSchema } from "@/lib/fodder-product-schema";';
const oldReturn = 'return { ...h, scripts: [...h.scripts, { type: "application/ld+json", children: JSON.stringify(local) }] };';
const newReturn = 'return { ...h, scripts: [...h.scripts, { type: "application/ld+json", children: JSON.stringify([local, fodderProductSchema(loaderData?.lang === "en" ? "en" : "cs")]) }] };';
if (!original.includes(oldReturn) && !original.includes(newReturn))
  throw new Error("Homepage head changed; refusing to apply an unsafe patch");
let updated = original;
if (!updated.includes(importLine)) updated = importLine + "\n" + updated;
if (updated.includes(oldReturn)) updated = updated.replace(oldReturn, newReturn);

const outputs = [
  [homeFile, updated],
  [join(root, "public/llms.txt"), readFileSync(join(sourceDir, "llms.txt"), "utf8")],
  [join(root, "src/lib/fodder-product-schema.ts"), readFileSync(join(sourceDir, "product-schema.ts"), "utf8")],
];
for (const [path, content] of outputs) {
  if (existsSync(path) && path !== homeFile && readFileSync(path, "utf8") !== content)
    throw new Error("Existing destination differs; refusing to overwrite: " + path);
}
for (const [path, content] of outputs) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log("Updated " + path);
}
console.log("Zelený Kůň SEO patch applied. Build, deploy and verify live URLs before claiming completion.");

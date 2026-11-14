// Regression-test the Zelený Kůň source patch without accessing Lovable.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const root = mkdtempSync(join(tmpdir(), "zelenykun-seo-"));
const sourceDir = resolve("seo-integrations/zelenykun");
const script = join(sourceDir, "apply-seo-patch.mjs");
try {
  mkdirSync(join(root, "src/routes"), { recursive: true });
  const homepage = [
    'import { createFileRoute } from "@tanstack/react-router";',
    'export const Route = createFileRoute("/")({',
    '  head: ({ loaderData }) => {',
    '    const h = { scripts: [] };',
    '    const local = { "@context": "https://schema.org", "@type": "LocalBusiness" };',
    '    return { ...h, scripts: [...h.scripts, { type: "application/ld+json", children: JSON.stringify(local) }] };',
    '  },',
    '});',
  ].join("\n");
  writeFileSync(join(root, "src/routes/index.tsx"), homepage);
  mkdirSync(join(root, "src/components"), { recursive: true });
  const pricingFile = join(root, "src/components/site.tsx");
  writeFileSync(pricingFile, "export const PRICE = 25;\nexport const MIN_CZK = 200;\n");

  const apply = () => spawnSync(process.execPath, [script, root], { encoding: "utf8" });
  const first = apply();
  assert.equal(first.status, 0, first.stderr);
  const output = readFileSync(join(root, "src/routes/index.tsx"), "utf8");
  assert.ok(output.includes("JSON.stringify([local, fodderProductSchema("));
  assert.equal(output.split("fodderProductSchema(").length - 1, 1);
  assert.ok(existsSync(join(root, "public/llms.txt")));
  assert.ok(existsSync(join(root, "src/lib/fodder-product-schema.ts")));
  const second = apply();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(readFileSync(join(root, "src/routes/index.tsx"), "utf8"), output);
  const llms = readFileSync(join(root, "public/llms.txt"), "utf8");
  assert.ok(llms.includes("https://zelenykun.com/feeding-guide"));
  assert.ok(llms.includes("25 CZK"));
  const schemaSource = readFileSync(join(root, "src/lib/fodder-product-schema.ts"), "utf8");
  assert.ok(schemaSource.includes('minValue: 8'), "Minimum order must be 8 kg");
  assert.ok(schemaSource.includes('unitCode: "KGM"'), "Offer quantity must use kg");
  assert.ok(!schemaSource.includes('availability:'), "Do not invent stock availability");

  // Execute both translations rather than checking source strings alone.
  // inLanguage belongs on the existing WebPage, not Product:
  // https://schema.org/inLanguage and https://schema.org/Product
  const { fodderProductSchema } = await import(pathToFileURL(join(root, "src/lib/fodder-product-schema.ts")).href);
  for (const lang of ["cs", "en"]) {
    const product = fodderProductSchema(lang);
    assert.equal(product["@type"], "Product");
    assert.equal(Object.hasOwn(product, "inLanguage"), false, "Product must not use the WebPage language property");
    assert.equal(product.url, "https://zelenykun.com/" + (lang === "en" ? "?lang=en" : ""));
    assert.equal(product.name, lang === "en" ? "Fresh hydroponic barley fodder" : "Čerstvé hydroponické ječné krmivo");
    assert.equal(Number(product.offers.price), 25);
    assert.equal(product.offers.priceCurrency, "CZK");
    assert.equal(product.offers.eligibleQuantity.minValue, 8);
    assert.equal(product.offers.priceSpecification.referenceQuantity.value, 1);
    assert.equal(product.offers.priceSpecification.referenceQuantity.unitCode, "KGM");
    assert.equal(Object.hasOwn(product.offers, "availability"), false);
  }

  // Never ship stale prices or minimum-order values in schema.
  writeFileSync(pricingFile, "export const PRICE = 30;\nexport const MIN_CZK = 200;\n");
  const stalePrice = apply();
  assert.notEqual(stalePrice.status, 0, "Changed price must be rejected");
  assert.equal(readFileSync(join(root, "src/routes/index.tsx"), "utf8"), output);
  writeFileSync(pricingFile, "export const PRICE = 25;\nexport const MIN_CZK = 200;\n");

  // Refuse unknown homepage structures without changing source.
  const incompatible = 'export const Route = createFileRoute("/")({});';
  writeFileSync(join(root, "src/routes/index.tsx"), incompatible);
  const rejected = apply();
  assert.notEqual(rejected.status, 0, "Unknown homepage must be rejected");
  assert.equal(readFileSync(join(root, "src/routes/index.tsx"), "utf8"), incompatible);
  console.log("Zelený Kůň source patch regression passed (combined JSON-LD, files and idempotence)");
} finally {
  rmSync(root, { recursive: true, force: true });
}

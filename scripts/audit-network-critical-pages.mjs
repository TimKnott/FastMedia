// Production SEO release gate across the connected portfolio.
// Uses public HTML only, requires no API keys or paid build credits.
import assert from "node:assert/strict";

const targets = [
  { name: "The Progenitors archive", url: "https://www.theprogenitors.com/archive/index.html", types: ["CollectionPage", "FAQPage"], text: "Frequently asked questions" },
  { name: "The Progenitors topic", url: "https://www.theprogenitors.com/topics/kemet-and-nubia/index.html", types: ["CollectionPage", "FAQPage"], text: "Frequently asked questions" },
  { name: "7HourTeacher help", url: "https://7hourteacher.com/help", types: ["FAQPage"], text: "Who is 7HourTeacher designed for?" },
  { name: "Koně a Stáje FAQ (Czech)", url: "https://koneastaje.com/faq", types: ["FAQPage", "BreadcrumbList"], language: "cs" },
  { name: "Koně a Stáje FAQ (English)", url: "https://koneastaje.com/faq?lang=en", types: ["FAQPage", "BreadcrumbList"], language: "en" },
  { name: "Koně a Stáje FAQ (German)", url: "https://koneastaje.com/faq?lang=de", types: ["FAQPage", "BreadcrumbList"], language: "de" },
  { name: "JusticeLeague country", url: "https://justiceleague.online/claims-directory/country/cz/index.html", types: ["FAQPage", "ItemList"] },
];
const failures = [];
for (const target of targets) {
  try {
    const response = await fetch(target.url, { signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const nodes = scripts.flatMap((match) => {
      try {
        const data = JSON.parse(match[1]);
        return (Array.isArray(data) ? data : [data]).flatMap((obj) => obj?.["@graph"] || [obj]);
      } catch { return []; }
    });
    const types = new Set(nodes.flatMap((node) => Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]]));
    const faq = nodes.find((node) => node["@type"] === "FAQPage");
    const canonicalTags = [...html.split("</head>")[0].matchAll(/<link[^>]*rel=["']canonical["'][^>]*>/gi)];
    const valid = response.status === 200 && canonicalTags.length === 1 &&
      target.types.every((type) => types.has(type)) &&
      (!target.text || html.includes(target.text)) &&
      (!target.language || faq?.inLanguage === target.language);
    if (!valid) failures.push({ name: target.name, status: response.status,
      foundTypes: [...types], canonicalCount: canonicalTags.length, faqLanguage: faq?.inLanguage });
    console.log((valid ? "PASS " : "FAIL ") + target.name);
  } catch (error) {
    failures.push({ name: target.name, error: String(error) });
    console.log("FAIL " + target.name);
  }
}
console.log("Critical page schema: " + (targets.length - failures.length) + "/" + targets.length + " passed");
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  if (process.argv.includes("--strict")) process.exitCode = 1;
}

// Live Zelený Kůň SEO release gate, including all CZ/EN sitemap URLs.
// The Product and llms checks intentionally fail until the prepared source
// files have actually been integrated into the live Zelený Kůň project.
const origin = "https://zelenykun.com";
const sitemapResponse = await fetch(origin + "/sitemap.xml", { signal: AbortSignal.timeout(15000) });
if (sitemapResponse.status !== 200) throw new Error("Sitemap not available");
const xml = await sitemapResponse.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, "&"));
if (!urls.length || new Set(urls).size !== urls.length) throw new Error("Empty or duplicate sitemap URLs");
const errors = [];
for (let i = 0; i < urls.length; i += 12) {
  const batch = await Promise.all(urls.slice(i, i + 12).map(async (url) => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const html = await response.text();
      const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] ||
        html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1];
      const head = html.split("</head>")[0];
      const alternates = [...head.matchAll(/<link[^>]*rel=["']alternate["'][^>]*>/gi)].map((match) => match[0].toLowerCase());
      const language = url.includes("lang=en") ? "en" : "cs";
      const hreflangValid = alternates.some((link) => link.includes('hreflang="' + language + '"'));
      const titleValid = /<title>[^<]+<\/title>/i.test(head);
      const descriptionValid = /<meta[^>]*name=["']description["'][^>]*>/i.test(head);
      return { url, status: response.status, valid: response.status === 200 &&
        canonical === url && hreflangValid && titleValid && descriptionValid };
    } catch (error) { return { url, valid: false, error: String(error) }; }
  }));
  errors.push(...batch.filter((item) => !item.valid));
}
const home = await (await fetch(origin + "/", { signal: AbortSignal.timeout(15000) })).text();
const scripts = [...home.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
const schemas = scripts.flatMap((match) => {
  try {
    const data = JSON.parse(match[1]);
    return (Array.isArray(data) ? data : [data]).flatMap((node) => node?.["@graph"] || [node]);
  } catch { return []; }
});
const product = schemas.find((schema) => schema["@type"] === "Product");
const offer = product?.offers;
const productValid = !!product && offer?.["@type"] === "Offer" &&
  offer.priceCurrency === "CZK" && Number(offer.price) === 25 &&
  offer.eligibleQuantity?.minValue === 8 && offer.eligibleQuantity?.unitCode === "KGM";
const englishHome = await (await fetch(origin + "/?lang=en", { signal: AbortSignal.timeout(15000) })).text();
const englishScripts = [...englishHome.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
const englishSchemas = englishScripts.flatMap((match) => {
  try {
    const data = JSON.parse(match[1]);
    return (Array.isArray(data) ? data : [data]).flatMap((node) => node?.["@graph"] || [node]);
  } catch { return []; }
});
const englishProduct = englishSchemas.find((schema) => schema["@type"] === "Product");
const englishPage = englishSchemas.find((schema) => schema["@type"] === "WebPage");
const englishValid = !!englishProduct && englishPage?.inLanguage === "en" &&
  englishProduct.url === origin + "/?lang=en" &&
  englishProduct.name === "Fresh hydroponic barley fodder" &&
  !Object.hasOwn(englishProduct, "inLanguage") &&
  englishProduct.offers?.priceCurrency === "CZK" &&
  Number(englishProduct.offers?.price) === 25 &&
  englishProduct.offers?.eligibleQuantity?.minValue === 8 &&
  englishProduct.offers?.eligibleQuantity?.unitCode === "KGM";
const llmsResponse = await fetch(origin + "/llms.txt", { signal: AbortSignal.timeout(15000) });
const llms = await llmsResponse.text();
const llmsValid = llmsResponse.status === 200 &&
  llms.trimStart().startsWith("#") && llms.includes(origin + "/feeding-guide");
console.log("Sitemap canonical URLs: " + (urls.length - errors.length) + "/" + urls.length);
console.log("Product/Offer JSON-LD (CZ): " + (productValid ? "PASS" : "MISSING"));
console.log("Product/Offer JSON-LD (EN): " + (englishValid ? "PASS" : "MISSING"));
console.log("AI discovery llms.txt: " + (llmsValid ? "PASS" : "MISSING"));
if (errors.length) console.error(JSON.stringify(errors.slice(0, 10), null, 2));
if ((errors.length || !productValid || !englishValid || !llmsValid) && process.argv.includes("--strict")) process.exitCode = 1;

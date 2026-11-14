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
      return { url, status: response.status, valid: response.status === 200 && canonical === url };
    } catch (error) { return { url, valid: false, error: String(error) }; }
  }));
  errors.push(...batch.filter((item) => !item.valid));
}
const home = await (await fetch(origin + "/", { signal: AbortSignal.timeout(15000) })).text();
const scripts = [...home.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
const schemas = scripts.flatMap((match) => {
  try { const data = JSON.parse(match[1]); return Array.isArray(data) ? data : [data]; }
  catch { return []; }
});
const product = schemas.find((schema) => schema["@type"] === "Product");
const offer = product?.offers;
const productValid = !!product && offer?.["@type"] === "Offer" &&
  offer.priceCurrency === "CZK" && Number(offer.price) === 25;
const llmsResponse = await fetch(origin + "/llms.txt", { signal: AbortSignal.timeout(15000) });
const llms = await llmsResponse.text();
const llmsValid = llmsResponse.status === 200 &&
  llms.trimStart().startsWith("#") && llms.includes(origin + "/feeding-guide");
console.log("Sitemap canonical URLs: " + (urls.length - errors.length) + "/" + urls.length);
console.log("Product/Offer JSON-LD: " + (productValid ? "PASS" : "MISSING"));
console.log("AI discovery llms.txt: " + (llmsValid ? "PASS" : "MISSING"));
if (errors.length) console.error(JSON.stringify(errors.slice(0, 10), null, 2));
if ((errors.length || !productValid || !llmsValid) && process.argv.includes("--strict")) process.exitCode = 1;

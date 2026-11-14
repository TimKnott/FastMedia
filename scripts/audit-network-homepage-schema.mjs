// Check the homepage canonical and structured-data graph across the agency network.
// Handles schema.org @graph and JSON-LD arrays without treating valid graphs as missing schema.
const domains = [
  "fastmedia.pro", "calcurly.com", "koneastaje.com",
  "7hourteacher.com", "www.theprogenitors.com", "zelenykun.com",
  "myname.co.uk", "justiceleague.online", "standatoys.com",
];
const failures = [];
for (const domain of domains) {
  const url = "https://" + domain + "/";
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const html = await response.text();
    const head = html.split("</head>")[0];
    const canonical = [...head.matchAll(/<link[^>]*rel=["']canonical["'][^>]*>/gi)];
    const descriptions = [...head.matchAll(/<meta[^>]*name=["']description["'][^>]*>/gi)];
    const scripts = [...head.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const nodes = scripts.flatMap((match) => {
      try {
        const data = JSON.parse(match[1]);
        const objects = Array.isArray(data) ? data : [data];
        return objects.flatMap((obj) => obj?.["@graph"] || [obj]);
      } catch { return []; }
    });
    const types = [...new Set(nodes.flatMap((node) => Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]]).filter(Boolean))];
    const valid = response.status === 200 && canonical.length === 1 &&
      descriptions.length === 1 && nodes.length > 0;
    if (!valid) failures.push({ domain, status: response.status, canonicals: canonical.length,
      descriptions: descriptions.length, schemaNodes: nodes.length });
    console.log(domain + ": " + (valid ? "OK" : "ISSUE") + " | " + types.join(", "));
  } catch (error) { failures.push({ domain, error: String(error) }); }
}
console.log("Homepage SEO: " + (domains.length - failures.length) + "/" + domains.length + " valid");
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  if (process.argv.includes("--strict")) process.exitCode = 1;
}

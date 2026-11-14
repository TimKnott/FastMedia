// Cross-site live SEO smoke test for FastMedia's public portfolio.
// Run: node scripts/verify-live-portfolio-seo.mjs
// Reports failures honestly; does not claim a deployment succeeded.
const sites = [
  "fastmedia.pro", "calcurly.com", "koneastaje.com",
  "7hourteacher.com", "www.theprogenitors.com", "zelenykun.com",
  "myname.co.uk", "justiceleague.online", "standatoys.com",
];
const results = [];
for (const domain of sites) {
  const site = { domain, checks: {}, issues: [] };
  for (const [path, predicate] of [
    ["/robots.txt", (body) => /User-agent:/i.test(body)],
    ["/sitemap.xml", (body) => /<urlset|<sitemapindex/i.test(body)],
    ["/llms.txt", (body) => /^#\s+\S/m.test(body)],
  ]) {
    try {
      const response = await fetch("https://" + domain + path, { signal: AbortSignal.timeout(12000) });
      const body = await response.text();
      const ok = response.status === 200 && predicate(body);
      site.checks[path] = { status: response.status, valid: ok };
      if (!ok) site.issues.push(path + " missing or invalid");
    } catch (error) {
      site.checks[path] = { error: String(error) };
      site.issues.push(path + " request failed");
    }
  }
  try {
    const response = await fetch("https://" + domain + "/", { signal: AbortSignal.timeout(12000) });
    const html = await response.text();
    const hasDescription = /<meta\b[^>]*name=["']description["']/i.test(html);
    const hasCanonical = /<link\b[^>]*rel=["']canonical["']/i.test(html);
    const hasJsonLd = /<script\b[^>]*type=["']application\/ld\+json["']/i.test(html);
    site.checks.home = { status: response.status, hasDescription, hasCanonical, hasJsonLd };
    if (response.status !== 200 || !hasDescription || !hasCanonical || !hasJsonLd)
      site.issues.push("homepage metadata, canonical or JSON-LD missing");
  } catch (error) {
    site.checks.home = { error: String(error) };
    site.issues.push("homepage request failed");
  }
  results.push(site);
  console.log(domain + ": " + (site.issues.length ? site.issues.join("; ") : "all smoke checks passed"));
}
const failures = results.filter((site) => site.issues.length);
console.log(JSON.stringify({ checked: results.length, passing: results.length - failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;

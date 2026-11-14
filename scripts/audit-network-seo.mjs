// Network-wide SEO endpoint audit for FastMedia projects.
// Usage: node scripts/audit-network-seo.mjs [--strict]
// Strict mode fails if any expected endpoint is missing or invalid.
const sites = [
  "fastmedia.pro", "calcurly.com", "koneastaje.com",
  "7hourteacher.com", "www.theprogenitors.com", "zelenykun.com",
  "myname.co.uk", "justiceleague.online", "standatoys.com",
];
const paths = ["/robots.txt", "/sitemap.xml", "/llms.txt"];
const rows = await Promise.all(sites.map(async (site) => {
  const checks = await Promise.all(paths.map(async (path) => {
    const url = "https://" + site + path;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      const content = await response.text();
      const valid = response.status === 200 &&
        (path === "/robots.txt" ? /User-agent:/i.test(content) :
         path === "/sitemap.xml" ? /<(urlset|sitemapindex)(?:\s|>)/i.test(content) :
         content.trimStart().startsWith("#"));
      return { path, status: response.status, valid };
    } catch (error) { return { path, valid: false, error: String(error) }; }
  }));
  return { site, checks };
}));
for (const row of rows) {
  const failures = row.checks.filter((check) => !check.valid);
  console.log(row.site + ": " + (failures.length ? "ISSUES " + failures.map((check) => check.path + " (" + (check.status || check.error) + ")").join(", ") : "robots, sitemap, llms OK"));
}
const failed = rows.flatMap((row) => row.checks.filter((check) => !check.valid).map((check) => row.site + check.path));
console.log("Network SEO endpoints: " + (rows.length * paths.length - failed.length) + "/" + (rows.length * paths.length) + " valid");
if (failed.length && process.argv.includes("--strict")) process.exitCode = 1;

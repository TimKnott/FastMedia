// Verify the prepared AI-discovery file points to real live pages.
// Does not publish or mutate the Zelený Kůň project.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "llms.txt"), "utf8");
const links = [...source.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
assert.ok(links.length >= 15, "AI discovery file has too few navigational links");
assert.equal(new Set(links).size, links.length, "Duplicate AI discovery links");
const problems = [];
for (let i = 0; i < links.length; i += 8) {
  const results = await Promise.all(links.slice(i, i + 8).map(async (url) => {
    if (!url.startsWith("https://zelenykun.com/")) return { url, error: "External link" };
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (response.status !== 200) return { url, status: response.status };
      if (url.endsWith(".xml") || url.endsWith(".txt")) return null;
      const html = await response.text();
      const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] ||
        html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1];
      return canonical === url ? null : { url, canonical };
    } catch (error) { return { url, error: String(error) }; }
  }));
  problems.push(...results.filter(Boolean));
}
console.log("Prepared Zelený Kůň llms.txt links: " + (links.length - problems.length) + "/" + links.length + " valid");
if (problems.length) {
  console.error(JSON.stringify(problems, null, 2));
  process.exitCode = 1;
}

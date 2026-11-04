import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { buildHead } from "../../scripts/prerender";

describe("/reviews is hidden from search", () => {
  it("is absent from the static sitemap", () => {
    const xml = readFileSync("public/sitemap.xml", "utf8");
    expect(xml).not.toContain("<loc>https://www.fastmedia.pro/reviews</loc>");
    expect(xml).toContain("<loc>https://www.fastmedia.pro/feature/reviews</loc>");
  });
  it("prerenders with robots noindex", () => {
    const head = buildHead({ path: "/reviews", title: "t", description: "d", noindex: true });
    expect(head).toContain('name="robots" content="noindex, follow"');
  });
  it("indexable routes keep index robots", () => {
    expect(buildHead({ path: "/about", title: "t", description: "d" })).toContain('content="index, follow');
  });
});

import { describe, expect, it } from "vitest";
import { websiteAdvantageSeoProjects } from "./websiteAdvantageSeoProjects";

describe("Website Advantage existing SEO project navigation", () => {
  it("contains exactly eight distinct project links", () => {
    expect(websiteAdvantageSeoProjects).toHaveLength(8);
    expect(new Set(websiteAdvantageSeoProjects.map(p => p.site)).size).toBe(8);
    expect(new Set(websiteAdvantageSeoProjects.map(p => p.projectUrl)).size).toBe(8);
    for (const p of websiteAdvantageSeoProjects) {
      expect(p.projectUrl).toMatch(/^https:\/\/app\.openseo\.so\/p\/[a-f0-9-]{36}$/);
    }
  });
  it("does not report a Search Console connection where one is unavailable", () => {
    expect(websiteAdvantageSeoProjects.filter(p => p.gscStatus === "selected")).toHaveLength(6);
    expect(websiteAdvantageSeoProjects.filter(p => p.gscStatus === "property_missing")
      .map(p => p.site).sort()).toEqual(["FastMedia.Pro", "StandaToys"]);
  });
});

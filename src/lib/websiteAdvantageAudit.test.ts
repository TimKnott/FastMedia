import { describe, expect, it } from "vitest";
import { imageStatusLabel, parsePublicMetadataAudit, PORTFOLIO_NAMES } from "./websiteAdvantageAudit";

const valid = {
  schema_version: 2,
  checked_at_utc: "2026-11-17T09:05:03Z",
  sites: PORTFOLIO_NAMES.map(name => ({
    name, state: "pass", approved_image_match: "match",
  })),
};
describe("local Website Advantage report import", () => {
  it("accepts a valid eight-site report, extracting only safe public fields", () => {
    const input = { ...valid, secret: "ignored", sites: valid.sites.map(s => ({ ...s, tracking_id: "ignored" })) };
    const report = parsePublicMetadataAudit(JSON.stringify(input));
    expect(report.sites).toHaveLength(8);
    expect(report.sites[0]).toEqual({ name: "FastMedia.Pro", state: "pass", approved_image_match: "match" });
    expect("secret" in report).toBe(false);
  });
  it("rejects invalid JSON and wrong versions", () => {
    expect(() => parsePublicMetadataAudit("not json")).toThrow("not valid JSON");
    expect(() => parsePublicMetadataAudit(JSON.stringify({ ...valid, schema_version: 1 }))).toThrow("version 2");
  });
  it("rejects duplicate or unexpected sites", () => {
    const duplicate = { ...valid, sites: [...valid.sites.slice(0, 7), valid.sites[0]] };
    expect(() => parsePublicMetadataAudit(JSON.stringify(duplicate))).toThrow("duplicate website");
    const unknown = { ...valid, sites: [...valid.sites.slice(0, 7), { name: "attacker.site", state: "pass", approved_image_match: "match" }] };
    expect(() => parsePublicMetadataAudit(JSON.stringify(unknown))).toThrow("unexpected");
  });
  it("rejects false status and broken timestamps", () => {
    const badStatus = { ...valid, sites: valid.sites.map((s, i) => i === 0 ? { ...s, state: "hacked" } : s) };
    expect(() => parsePublicMetadataAudit(JSON.stringify(badStatus))).toThrow("unsupported");
    expect(() => parsePublicMetadataAudit(JSON.stringify({ ...valid, checked_at_utc: "not a time" }))).toThrow("timestamp");
  });
  it("handles approved Base44 resize variants separately", () => {
    expect(imageStatusLabel("platform_resized")).toContain("platform resize");
    expect(imageStatusLabel("different")).toContain("Different image");
  });
  it("rejects excessively large payloads", () => {
    expect(() => parsePublicMetadataAudit(" ".repeat(1024 * 1024 + 1))).toThrow("1 MB");
  });
});

import { describe, expect, it } from "vitest";
import { PORTFOLIO_NAMES } from "./websiteAdvantageAudit";
import { parseDiscoveryAudit, discoveryStatusLabel } from "./websiteAdvantageDiscovery";
const resources = {
  "robots.txt": {state:"present",status_code:200},
  "sitemap.xml": {state:"present",status_code:200,entry_count:123,sitemap_kind:"urlset"},
  "llms.txt": {state:"missing_or_error",status_code:404},
};
const payload = {
  schema_version:1,
  checked_at_utc:"2026-11-17T09:25:00Z",
  sites:PORTFOLIO_NAMES.map(name=>({name,resources})),
};
describe("browser-local public discovery report import",()=>{
  it("parses eight sites and per-resource evidence",()=>{
    const report=parseDiscoveryAudit(JSON.stringify(payload));
    expect(report.sites).toHaveLength(8);
    expect(report.sites[0].resources["sitemap.xml"].entry_count).toBe(123);
    expect(discoveryStatusLabel(report.sites[0].resources["llms.txt"].state)).toBe("Missing / error");
  });
  it("rejects wrong versions and duplicate websites",()=>{
    expect(()=>parseDiscoveryAudit(JSON.stringify({...payload,schema_version:2}))).toThrow("version 1");
    const bad={...payload,sites:[...payload.sites.slice(0,7),payload.sites[0]]};
    expect(()=>parseDiscoveryAudit(JSON.stringify(bad))).toThrow("duplicate");
  });
  it("rejects invalid status, missing resources and timestamps",()=>{
    const invalid=JSON.parse(JSON.stringify(payload));
    invalid.sites[0].resources["robots.txt"].state="admin";
    expect(()=>parseDiscoveryAudit(JSON.stringify(invalid))).toThrow("invalid");
    const missing=JSON.parse(JSON.stringify(payload));
    delete missing.sites[0].resources["sitemap.xml"];
    expect(()=>parseDiscoveryAudit(JSON.stringify(missing))).toThrow("invalid");
    expect(()=>parseDiscoveryAudit(JSON.stringify({...payload,checked_at_utc:"bad"}))).toThrow("timestamp");
  });
  it("ignores arbitrary extra fields and never returns them",()=>{
    const input={...payload,secret:"ignored"};
    const parsed=parseDiscoveryAudit(JSON.stringify(input));
    expect("secret" in parsed).toBe(false);
    expect(parsed.sites[0].resources["sitemap.xml"]).toEqual({
      state:"present",status_code:200,entry_count:123,sitemap_kind:"urlset",
    });
  });
});

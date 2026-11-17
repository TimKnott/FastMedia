/** Strict browser-local parsing of the public Website Advantage discovery audit. */
import { PORTFOLIO_NAMES, type PortfolioName } from "./websiteAdvantageAudit";

export type DiscoveryState = "present" | "needs_review" | "missing_or_error" | "unknown";
export type DiscoveryPath = "robots.txt" | "sitemap.xml" | "llms.txt";
export interface DiscoveryResource {
  state: DiscoveryState;
  status_code?: number;
  entry_count?: number;
  sitemap_kind?: "urlset" | "sitemapindex";
}
export interface DiscoverySite {
  name: PortfolioName;
  resources: Record<DiscoveryPath, DiscoveryResource>;
}
export interface DiscoveryReport {
  schema_version: 1;
  checked_at_utc: string;
  sites: DiscoverySite[];
}
const allowedStates = new Set<DiscoveryState>(["present","needs_review","missing_or_error","unknown"]);
const paths: DiscoveryPath[] = ["robots.txt","sitemap.xml","llms.txt"];
const nameSet = new Set<string>(PORTFOLIO_NAMES);
const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export function parseDiscoveryAudit(source: string): DiscoveryReport {
  if (source.length > 1024*1024) throw new Error("Report exceeds the 1 MB import limit.");
  let raw: unknown;
  try { raw = JSON.parse(source); }
  catch { throw new Error("This is not valid JSON."); }
  if (!object(raw) || raw.schema_version !== 1 || !Array.isArray(raw.sites)
      || raw.sites.length !== PORTFOLIO_NAMES.length)
    throw new Error("Incompatible discovery report. Expected version 1 and eight sites.");
  if (typeof raw.checked_at_utc !== "string" || Number.isNaN(Date.parse(raw.checked_at_utc)))
    throw new Error("The discovery report has no valid verification timestamp.");
  const seen = new Set<string>();
  const sites = raw.sites.map((value: unknown): DiscoverySite => {
    if (!object(value) || typeof value.name !== "string" || !nameSet.has(value.name)
        || seen.has(value.name) || !object(value.resources))
      throw new Error("Unexpected, duplicate or incomplete discovery website.");
    seen.add(value.name);
    const resources = {} as DiscoverySite["resources"];
    for (const key of paths) {
      const candidate = value.resources[key];
      if (!object(candidate) || typeof candidate.state !== "string" ||
          !allowedStates.has(candidate.state as DiscoveryState))
        throw new Error("The discovery report contains an invalid resource status.");
      const result: DiscoveryResource = { state: candidate.state as DiscoveryState };
      if (typeof candidate.status_code === "number" && Number.isInteger(candidate.status_code)
          && candidate.status_code >= 100 && candidate.status_code <= 599)
        result.status_code = candidate.status_code;
      if (key === "sitemap.xml" && typeof candidate.entry_count === "number"
          && Number.isInteger(candidate.entry_count) && candidate.entry_count >= 0
          && candidate.entry_count <= 50000)
        result.entry_count = candidate.entry_count;
      if (key === "sitemap.xml" &&
          (candidate.sitemap_kind === "urlset" || candidate.sitemap_kind === "sitemapindex"))
        result.sitemap_kind = candidate.sitemap_kind;
      resources[key] = result;
    }
    return { name: value.name as PortfolioName, resources };
  });
  return { schema_version: 1, checked_at_utc: raw.checked_at_utc, sites };
}

export function discoveryStatusLabel(state: DiscoveryState): string {
  switch (state) {
    case "present": return "Found";
    case "needs_review": return "Review";
    case "missing_or_error": return "Missing / error";
    default: return "Unknown";
  }
}

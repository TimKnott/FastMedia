/** Read-only, local parsing of Website Advantage public metadata audit exports.
 * Never executes source content, stores reports remotely, or treats network errors as downtime.
 */
export const PORTFOLIO_NAMES = [
  "FastMedia.Pro", "SevenHourTeacher", "Koně a Stáje", "Zelený Kůň",
  "StandaToys", "The Progenitors", "Calcurly", "JusticeLeague",
] as const;
export type PortfolioName = typeof PORTFOLIO_NAMES[number];
export type MetadataStatus = "pass" | "needs_review" | "unknown";
export type ImageStatus = "match" | "platform_resized" | "different" | "missing" | "unknown";

export interface MetadataAuditSite {
  name: PortfolioName;
  state: MetadataStatus;
  approved_image_match: ImageStatus;
}
export interface MetadataAuditReport {
  schema_version: 2;
  checked_at_utc: string;
  sites: MetadataAuditSite[];
}

const statusValues = new Set<MetadataStatus>(["pass", "needs_review", "unknown"]);
const imageValues = new Set<ImageStatus>(["match", "platform_resized", "different", "missing", "unknown"]);
const names = new Set<string>(PORTFOLIO_NAMES);
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Throws a user-safe error for invalid/old exports. Ignore unknown extra fields. */
export function parsePublicMetadataAudit(source: string): MetadataAuditReport {
  if (source.length > 1024 * 1024) throw new Error("Report exceeds the 1 MB import limit.");
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch {
    throw new Error("This is not valid JSON.");
  }
  if (!isRecord(raw) || raw.schema_version !== 2 || !Array.isArray(raw.sites)) {
    throw new Error("This is not a compatible Website Advantage metadata audit (version 2).");
  }
  if (typeof raw.checked_at_utc !== "string" || Number.isNaN(Date.parse(raw.checked_at_utc))) {
    throw new Error("The report has no valid verification timestamp.");
  }
  if (raw.sites.length !== PORTFOLIO_NAMES.length) {
    throw new Error("The report must include exactly eight portfolio sites.");
  }
  const seen = new Set<string>();
  const sites: MetadataAuditSite[] = raw.sites.map((item: unknown) => {
    if (!isRecord(item) || typeof item.name !== "string" ||
        !names.has(item.name) || seen.has(item.name)) {
      throw new Error("The report contains an unexpected or duplicate website.");
    }
    seen.add(item.name);
    if (typeof item.state !== "string" || !statusValues.has(item.state as MetadataStatus) ||
        typeof item.approved_image_match !== "string" ||
        !imageValues.has(item.approved_image_match as ImageStatus)) {
      throw new Error("The report contains an unsupported verification status.");
    }
    return {
      name: item.name as PortfolioName,
      state: item.state as MetadataStatus,
      approved_image_match: item.approved_image_match as ImageStatus,
    };
  });
  return { schema_version: 2, checked_at_utc: raw.checked_at_utc, sites };
}

export function imageStatusLabel(status: ImageStatus): string {
  switch (status) {
    case "match": return "Approved image matched";
    case "platform_resized": return "Approved image via platform resize";
    case "different": return "Different image on live page";
    case "missing": return "Image missing from metadata";
    default: return "Image not verified";
  }
}

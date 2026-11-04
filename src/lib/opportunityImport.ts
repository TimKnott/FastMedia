/** Client-side preview validation for opportunity imports. Server RPC re-validates everything. */
import { safeHttpUrl } from './prospectLinks';
import { detectSignals, scoreSignals } from './buyingSignals';

export type OppKind = 'active_buyer_request' | 'prospect_hypothesis';
export const NON_REQUEST_SOURCES = ['company_website', 'directory_listing', 'social_profile'];
const PERSONAL_DOMAINS = /@(gmail|seznam|email|outlook|hotmail|yahoo|icloud|centrum|post|volny|gmx|web)\./i;

export interface PreviewRow {
  index: number;
  row: Record<string, unknown>;
  errors: string[];
  notes: string[];
  duplicateInFile: boolean;
}

export const normaliseUrl = (u: string) =>
  u.trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/[/#?]+$/, '').toLowerCase();

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
    else if (c === '"') q = true;
    else if (c === ',') { cur.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; cur.push(field); rows.push(cur); cur = []; field = ''; }
    else field += c;
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  if (!head) return [];
  const keys = head.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

const LIST_FIELDS = ['deliverables', 'risks'];
export function parseImport(text: string, filename: string): Record<string, unknown>[] {
  if (/\.json$/i.test(filename) || /^\s*[[{]/.test(text)) {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : Array.isArray(data?.opportunities) ? data.opportunities : [];
  }
  return parseCsv(text).map((r) => {
    const o: Record<string, unknown> = { ...r };
    for (const f of LIST_FIELDS) if (typeof r[f] === 'string') o[f] = r[f] ? r[f].split('|').map((s) => s.trim()).filter(Boolean) : [];
    if (r.evidence) o.evidence = [{ text: r.evidence, source_url: r.source_url }];
    return o;
  });
}

export function validateRows(rows: Record<string, unknown>[]): PreviewRow[] {
  const seen = new Set<string>();
  return rows.map((row, i) => {
    const errors: string[] = []; const notes: string[] = [];
    const url = safeHttpUrl(row.source_url);
    if (!url || !/^https?:\/\//i.test(String(row.source_url ?? '').trim())) errors.push('Missing or invalid source_url');
    if (!String(row.title ?? '').trim()) errors.push('Missing title');
    const kind = row.kind as string;
    const st = String(row.source_type ?? '').toLowerCase();
    if (kind !== 'active_buyer_request' && kind !== 'prospect_hypothesis') errors.push('kind must be active_buyer_request or prospect_hypothesis');
    if (kind === 'active_buyer_request' && (!st || NON_REQUEST_SOURCES.includes(st)))
      errors.push('A company website, listing or social page is not a buyer request — use prospect_hypothesis');
    const contact = String(row.public_contact_route ?? '');
    if (PERSONAL_DOMAINS.test(contact) && String(row.contact_published_by_business) !== 'true')
      errors.push('Personal-looking contact without evidence it is business-published');
    const dup = !!url && seen.has(normaliseUrl(url));
    if (url) seen.add(normaliseUrl(url));
    if (dup) notes.push('Duplicate source URL in file — will be skipped');
    return { index: i + 1, row, errors, notes, duplicateInFile: dup };
  });
}

/** Score is recomputed locally from evidence; any score supplied in the file is ignored. */
export function prepareForImport(rows: PreviewRow[]) {
  return rows.filter((r) => !r.errors.length && !r.duplicateInFile).map(({ row }) => {
    const evidence = Array.isArray(row.evidence) ? row.evidence as { text?: string; source_url?: string; observed_at?: string }[] : [];
    const signals = evidence.flatMap((e) => detectSignals(String(e?.text ?? ''), e?.source_url ?? null, e?.observed_at ?? (row.posted_at as string) ?? null))
      .map((s) => ({ ...s, deadlineAt: (row.deadline_at as string) ?? null }));
    const result = scoreSignals(signals);
    return { ...row, priority_score: result.score, score_breakdown: result };
  });
}

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

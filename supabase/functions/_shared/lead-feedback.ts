// Turns the admin's "bad result" reports into search guidance + a domain blocklist.
// deno-lint-ignore no-explicit-any
type Db = any;

const LABEL: Record<string, string> = {
  wrong_business: 'not the right kind of business',
  wrong_link: 'link pointed to a council/municipality, directory or unrelated site',
  dead_link: 'website broken or missing',
  outside_area: 'outside the requested area',
  closed: 'closed / no longer trading',
  duplicate: 'duplicate',
};

export const domainOf = (u: string) => {
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
};

export const BASE_RULES = `Quality rules:
- website must be the business's OWN website. Never use a municipality/council (obec, město, mestys, úřad), tourist-info, news, Wikipedia or generic directory page as website — put such pages in source_url only, or leave website empty.
- Each result must clearly be the requested type of business; skip anything uncertain.
- Always write website URLs in full, starting with https://`;

export async function feedbackGuidance(db: Db, siteId: string) {
  const { data } = await db.from('lead_feedback').select('reason,title,website').eq('site_id', siteId).order('created_at', { ascending: false }).limit(40);
  const rows = (data ?? []) as { reason: string; title: string; website: string }[];
  const blocked = new Set(rows.filter((r) => ['wrong_business', 'wrong_link', 'closed'].includes(r.reason)).map((r) => domainOf(r.website)).filter(Boolean));
  const blockedTitles = new Set(rows.map((r) => r.title?.toLowerCase()).filter(Boolean));
  const text = rows.length
    ? `\nThe owner reported these earlier results as BAD — avoid similar mistakes:\n${rows.slice(0, 25).map((r) => `- "${r.title}"${r.website ? ` (${domainOf(r.website)})` : ''}: ${LABEL[r.reason] ?? r.reason}`).join('\n')}`
    : '';
  return { text: `\n${BASE_RULES}${text}`, blocked, blockedTitles };
}

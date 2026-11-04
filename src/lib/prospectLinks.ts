/** Safe link helpers for admin prospect cards. Never invents URLs. */
export const safeHttpUrl = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value || /\s/.test(value)) return null;
  if (!/^https?:\/\//i.test(value)) {
    if (/^[a-z]+:/i.test(value) || !/^[\w-]+(\.[\w-]+)+/.test(value)) return null;
    value = `https://${value}`;
  }
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
};

export const safeMailto = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  const email = raw.trim();
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email) ? `mailto:${email}` : null;
};

const sameUrl = (a: string, b: string) =>
  a.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').toLowerCase() ===
  b.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').toLowerCase();

export const isDirectoryListing = (url: string | null) => !!url && /(^|\.)firmy\.cz$/i.test(new URL(url).hostname);

/** Returns a stored source URL only if it exists and differs from the website. */
export const distinctSourceUrl = (research: unknown, website: string | null): string | null => {
  if (!research || typeof research !== 'object') return null;
  const r = research as Record<string, unknown>;
  for (const key of ['source_url', 'original_source_url', 'listing_url']) {
    const url = safeHttpUrl(r[key]);
    if (url && (!website || !sameUrl(url, website))) return url;
  }
  return null;
};

export interface ChatGptFacts {
  kind: 'prospect' | 'opportunity';
  [label: string]: unknown;
}

export const chatGptUrl = (intro: string, facts: Record<string, unknown>): string => {
  const lines = Object.entries(facts)
    .filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && !v.length) && String(v).trim() !== '')
    .map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join('; ') : String(v)}`);
  const prompt = `${intro}\n\nFacts (use only these; do not invent anything else):\n${lines.join('\n')}`;
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt.slice(0, 6000))}`;
};

export const prospectChatGptUrl = (p: {
  company: string; contact_name: string | null; email: string; website: string | null;
  region: string | null; trade: string | null; language?: string; source: string; notes: string | null;
  research?: { summary?: string; signals?: string[]; hooks?: string[]; pain_points?: string[]; industry?: string } | null;
}, sourceUrl: string | null = null) =>
  chatGptUrl(
    `I run FastMedia.Pro, a web-design agency. Assess this business as a prospect and help me draft a short, polite, personalised first outreach email in the prospect's language (${p.language || 'cs'}), then give an English explanation and translation. Flag anything that must be checked before contacting them, including whether I have a lawful basis to send marketing email.`,
    {
      Company: p.company, Contact: p.contact_name, Email: p.email,
      'Website / listing': safeHttpUrl(p.website), 'Original source': sourceUrl,
      Region: p.region, Trade: p.trade ?? p.research?.industry, 'Research summary': p.research?.summary,
      Signals: p.research?.signals, 'Pain points': p.research?.pain_points, Hooks: p.research?.hooks,
      Notes: p.notes, 'Source label': p.source,
    },
  );

// Pure helpers for the cold-email studio: templates, merge fields, guide, checks.

export interface StudioTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body_html: string;
  builtin?: boolean;
  is_favourite?: boolean;
}

export const MERGE_FIELDS = ['company', 'first_name', 'city', 'trade', 'website', 'video_link', 'sender_name'] as const;
export type MergeField = (typeof MERGE_FIELDS)[number];

const p = (s: string) => `<p>${s}</p>`;
const SIGN = p('Best regards,<br>{{sender_name}}<br>FastMedia.Pro · <a href="https://www.fastmedia.pro">www.fastmedia.pro</a>');

export const BUILTIN_TEMPLATES: StudioTemplate[] = [
  { id: 'b-no-site', builtin: true, category: 'first_touch', name: 'First touch — no website', subject: 'Quick question about {{company}}',
    body_html: p('Hello {{first_name}},') + p('I searched for a {{trade}} in {{city}} and found {{company}}, but I couldn\'t find a website for you. People increasingly check a website before they call.') + p('We build simple, professional websites with online booking for local businesses. Would a short example for {{company}} be useful?') + SIGN },
  { id: 'b-old-site', builtin: true, category: 'first_touch', name: 'First touch — outdated website', subject: '{{company}} website on mobile',
    body_html: p('Hello {{first_name}},') + p('I had a look at {{website}} on my phone. A few things make it harder for customers to contact you quickly, such as small text and no clear call button.') + p('I\'d be happy to send a short list of three easy fixes, free of charge. Shall I?') + SIGN },
  { id: 'b-google', builtin: true, category: 'first_touch', name: 'First touch — weak Google listing', subject: 'Your Google listing, {{company}}',
    body_html: p('Hello {{first_name}},') + p('When I search for "{{trade}} {{city}}", {{company}} is hard to find. A connected website and complete Google profile usually help local customers find you.') + p('Would you like me to show you what I mean in a two-minute reply?') + SIGN },
  { id: 'b-booking', builtin: true, category: 'first_touch', name: 'First touch — no online booking', subject: 'Online bookings for {{company}}?',
    body_html: p('Hello {{first_name}},') + p('I noticed customers can\'t book with {{company}} online. A booking calendar lets people reserve a time even when you\'re busy with work.') + p('We include one with our websites. May I send a quick example?') + SIGN },
  { id: 'b-offer', builtin: true, category: 'offer', name: '€20/month website offer', subject: 'A website for {{company}} for €20/month',
    body_html: p('Hello {{first_name}},') + p('We offer local businesses a ready-made website with online booking for €20/month. No setup fee and no design fee. It includes hosting, monthly checks and up to one hour of edits each month.') + p('<a href="https://www.fastmedia.pro/business" style="display:inline-block;background:#e8553f;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">See how it works</a>') + SIGN },
  { id: 'b-video', builtin: true, category: 'video', name: 'Personal video intro', subject: 'I recorded a short video for {{company}}',
    body_html: p('Hello {{first_name}},') + p('I recorded a short video showing a couple of ideas for {{company}}\'s online presence. It takes under two minutes.') + p('<a href="{{video_link}}">▶ Watch the video</a>') + SIGN },
  { id: 'b-fu1', builtin: true, category: 'follow_up', name: 'Follow-up 1 (gentle)', subject: 'Re: {{company}}',
    body_html: p('Hello {{first_name}},') + p('Just checking my last email reached you. Happy to send that short example for {{company}} if it\'s useful.') + SIGN },
  { id: 'b-fu2', builtin: true, category: 'follow_up', name: 'Follow-up 2 (value)', subject: 'One idea for {{company}}',
    body_html: p('Hello {{first_name}},') + p('One quick idea: adding a clear "Call now" button to the top of your page on mobile is often the easiest way to get more enquiries.') + p('If you\'d like more like this, just reply.') + SIGN },
  { id: 'b-breakup', builtin: true, category: 'follow_up', name: 'Break-up email', subject: 'Shall I close your file?',
    body_html: p('Hello {{first_name}},') + p('I haven\'t heard back, so I\'ll assume now isn\'t the right time. If that changes, just reply to this email.') + p('All the best to {{company}}.') + SIGN },
  { id: 'b-referral', builtin: true, category: 'referral', name: 'Referral ask', subject: 'Do you know a business that needs a website?',
    body_html: p('Hello {{first_name}},') + p('If you know a local business that needs a better website, our referral programme rewards successful introductions.') + p('<a href="https://www.fastmedia.pro/partners">Become a referral partner</a>') + SIGN },
];

/** Replaces {{field}} with row values, falling back to provided defaults. Returns missing fields. */
export function renderMerge(text: string, row: Record<string, string>, fallbacks: Record<string, string> = {}) {
  const missing = new Set<string>();
  const out = text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_m, key: string) => {
    const k = key.toLowerCase();
    const v = (row[k] ?? '').trim() || (fallbacks[k] ?? '').trim();
    if (!v) missing.add(k);
    return v;
  });
  return { text: out, missing: [...missing] };
}

export function findPlaceholders(text: string): string[] {
  return [...new Set((text.match(/\{\{\s*[a-z_]+\s*\}\}/gi) ?? []).map((s) => s.replace(/[{}\s]/g, '').toLowerCase()))];
}

/** Parses CSV or tab-separated text (pasted from a spreadsheet). First row = headers. */
export function parseTable(input: string): { headers: string[]; rows: Record<string, string>[] } {
  const text = input.replace(/\r\n?/g, '\n').trim();
  if (!text) return { headers: [], rows: [] };
  const firstLine = text.split('\n')[0];
  const delim = firstLine.includes('\t') ? '\t' : firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';
  const records: string[][] = [];
  let cur: string[] = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === delim) { cur.push(field); field = ''; }
    else if (c === '\n') { cur.push(field); records.push(cur); cur = []; field = ''; }
    else field += c;
  }
  cur.push(field); records.push(cur);
  const headers = records[0].map((h) => h.trim());
  const rows = records.slice(1).filter((r) => r.some((v) => v.trim())).map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])),
  );
  return { headers, rows };
}

/** Guesses which spreadsheet column maps to each merge field. */
export function guessMapping(headers: string[]): Partial<Record<MergeField, string>> {
  const rules: Record<MergeField, RegExp> = {
    company: /company|firma|business|název|name of/i,
    first_name: /first|jméno|vorname|contact|kontakt/i,
    city: /city|město|town|ort|stadt|region/i,
    trade: /trade|obor|industry|branche|category/i,
    website: /web|url|site/i,
    video_link: /video/i,
    sender_name: /sender/i,
  };
  const m: Partial<Record<MergeField, string>> = {};
  for (const f of MERGE_FIELDS) {
    const h = headers.find((x) => rules[f].test(x) && !Object.values(m).includes(x));
    if (h) m[f] = h;
  }
  return m;
}

// ---- "Which email should I send?" guide ----
export type Signal = 'no_site' | 'old_site' | 'weak_google' | 'no_booking' | 'unknown';
export interface GuideAdvice { templateId: string; reason: string; subjects: string[]; tip: string }

const BOOKING_TRADES = ['salon', 'clinic', 'fitness', 'equestrian', 'restaurant'];

export function recommendEmail(trade: string, signal: Signal): GuideAdvice {
  const bookingHeavy = BOOKING_TRADES.includes(trade);
  if (signal === 'no_site') return { templateId: 'b-no-site', reason: 'With no website, the strongest hook is the customers who search and can\'t find them. Keep it short and plain.', subjects: ['Quick question about {{company}}', 'Couldn\'t find {{company}} online'], tip: 'Under 90 words, one question, no images.' };
  if (signal === 'no_booking' || (signal === 'unknown' && bookingHeavy)) return { templateId: 'b-booking', reason: 'Appointment-based businesses lose bookings out of hours. An online calendar is a concrete, easy-to-picture benefit.', subjects: ['Online bookings for {{company}}?', 'Bookings while you work'], tip: 'Mention one realistic scenario (e.g. a customer booking in the evening).' };
  if (signal === 'old_site') return { templateId: 'b-old-site', reason: 'Owners with a site already invested once. Offer free, specific fixes rather than a rebuild to start the conversation.', subjects: ['{{company}} website on mobile', '3 quick fixes for {{company}}'], tip: 'Name one real issue you saw — never invent one.' };
  if (signal === 'weak_google') return { templateId: 'b-google', reason: 'Local search visibility is tangible: they can check it themselves in seconds.', subjects: ['Your Google listing, {{company}}', 'Searching for {{trade}} in {{city}}'], tip: 'Do not promise rankings.' };
  return { templateId: 'b-offer', reason: 'When you know little, a clear, honest offer with the price up front filters interest quickly.', subjects: ['A website for {{company}} for €20/month'], tip: 'Follow up twice, then send the break-up email.' };
}

export const GUIDE_TRADES: { id: string; label: string }[] = [
  { id: 'trades', label: 'Tradesperson (plumber, electrician…)' },
  { id: 'salon', label: 'Salon / beauty' },
  { id: 'restaurant', label: 'Restaurant / café' },
  { id: 'clinic', label: 'Clinic / therapist' },
  { id: 'fitness', label: 'Fitness studio' },
  { id: 'equestrian', label: 'Horse business' },
  { id: 'eshop', label: 'E-shop / retailer' },
  { id: 'other', label: 'Other service business' },
];

export const WRITING_PROMPTS = [
  'Opening line: mention one specific, true thing you noticed about them.',
  'Name one problem in their words (missed calls, no bookings, hard to find).',
  'One sentence on what you do — no jargon.',
  'Ask one low-effort question ("Shall I send an example?").',
  'Keep it under 120 words; plain text beats heavy design for a first email.',
];

const SPAM_WORDS = ['free!!!', 'guarantee', 'act now', 'winner', '100%', 'risk-free', 'click here', 'urgent', 'zdarma!!!', 'garantie', 'limited time'];

export function checkEmail(subject: string, html: string) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  const lower = (subject + ' ' + text).toLowerCase();
  const issues: string[] = [];
  const spam = SPAM_WORDS.filter((w) => lower.includes(w));
  if (spam.length) issues.push(`Spam-like words: ${spam.join(', ')}`);
  if (words > 180) issues.push(`Long (${words} words) — first emails work best under 120.`);
  if (subject.length > 60) issues.push('Subject over 60 characters.');
  if (/[A-Z]{6,}/.test(subject)) issues.push('Subject has shouting capitals.');
  const links = (html.match(/<a\s/gi) ?? []).length;
  if (links > 3) issues.push(`${links} links — keep to 1–2.`);
  if ((html.match(/<img/gi) ?? []).length > 1) issues.push('More than one image can hurt inbox placement.');
  if (!subject.trim()) issues.push('Subject is empty.');
  return { words, issues };
}

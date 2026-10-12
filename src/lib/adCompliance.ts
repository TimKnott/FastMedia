// Deterministic advert pre-flight rules for Sklik, Google Ads and Meta.
export type Platform = 'sklik' | 'google' | 'meta';
export type Severity = 'error' | 'warning';
export type Issue = { field: string; severity: Severity; rule: string; message: string };
export type AdFields = Record<string, string>;

export const PLATFORM_FIELDS: Record<Platform, { key: string; label: string; max: number; multiline?: boolean }[]> = {
  sklik: [
    { key: 'h1', label: 'Headline 1', max: 30 },
    { key: 'h2', label: 'Headline 2', max: 30 },
    { key: 'h3', label: 'Headline 3', max: 30 },
    { key: 'd1', label: 'Description 1', max: 90, multiline: true },
    { key: 'd2', label: 'Description 2', max: 90, multiline: true },
  ],
  google: [
    { key: 'h1', label: 'Headline 1', max: 30 },
    { key: 'h2', label: 'Headline 2', max: 30 },
    { key: 'h3', label: 'Headline 3', max: 30 },
    { key: 'd1', label: 'Description 1', max: 90, multiline: true },
    { key: 'd2', label: 'Description 2', max: 90, multiline: true },
  ],
  meta: [
    { key: 'primary', label: 'Primary text', max: 125, multiline: true },
    { key: 'headline', label: 'Headline', max: 40 },
    { key: 'description', label: 'Description', max: 30 },
  ],
};

const SUPERLATIVES = /\b(nej[a-zá-ž]{3,}|jednička|bezkonkurenční|nepřekonateln\w*|garantovan[ěý] nejnižší|best|cheapest|no\.?\s?1|number one|#1)\b/giu;
const PHONE = /(\+?\d[\d\s-]{7,}\d)/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const EMOJI = /[\p{Extended_Pictographic}★☆✓✔➜→►•]/u;
const PERSONAL = /\b(jste|máte|trpíte|are you|do you have|you suffer)\b.{0,40}\b(dluh|nemoc|nadváh|depres|rozved|chud|debt|ill|overweight|depress|divorc|broke|diabet)/iu;
const AGGRESSIVE = /\b(zaručen[ěý] výsledek|100 ?% (úspěch|garance)|zbohatněte|guaranteed results|get rich)\b/iu;

function titleCased(text: string): boolean {
  const words = text.trim().split(/\s+/).filter((w) => /^\p{L}{3,}$/u.test(w));
  if (words.length < 3) return false;
  const caps = words.slice(1).filter((w) => /^\p{Lu}\p{Ll}/u.test(w)).length;
  return caps >= Math.ceil((words.length - 1) / 2);
}

export function checkAd(platform: Platform, ad: AdFields): Issue[] {
  const issues: Issue[] = [];
  const add = (field: string, severity: Severity, rule: string, message: string) => issues.push({ field, severity, rule, message });
  const fields = PLATFORM_FIELDS[platform];
  let exclaim = 0;
  const seen = new Map<string, string>();

  for (const f of fields) {
    const v = (ad[f.key] ?? '').trim();
    if (!v) { if (f.key === 'h1' || f.key === 'primary' || f.key === 'd1') add(f.label, 'error', 'Required', 'This field is required.'); continue; }
    if (v.length > f.max) add(f.label, 'error', 'Length', `${v.length}/${f.max} characters — too long.`);
    const ex = (v.match(/!/g) ?? []).length;
    exclaim += ex;
    if (/[!?]{2,}/.test(v)) add(f.label, 'error', 'Punctuation', 'Repeated ! or ? is not allowed.');
    if (/\.{3}|…/.test(v)) add(f.label, 'error', 'Punctuation', 'Ellipses (…) are not allowed.');
    if (EMOJI.test(v)) add(f.label, 'error', 'Symbols', 'Emojis and decorative symbols are not allowed.');
    if (/\b\p{Lu}{4,}\b/u.test(v) && !/\b(DPH|SEO|CZK|PWA|HTML)\b/.test(v)) add(f.label, 'error', 'Capitals', 'Words in ALL CAPS are rejected.');

    if (platform !== 'meta') {
      if (f.key.startsWith('h') && ex > 0 && (platform === 'google' || f.key === 'h1')) add(f.label, 'error', 'Punctuation', 'No exclamation mark allowed in this headline.');
      if (PHONE.test(v)) add(f.label, 'error', 'Contact info', 'Phone numbers belong in a call extension, not ad text.');
      if (EMAIL.test(v)) add(f.label, 'error', 'Contact info', 'Email addresses are not allowed in ad text.');
      const sup = v.match(SUPERLATIVES);
      if (sup) add(f.label, platform === 'sklik' ? 'error' : 'warning', 'Superlative', `"${sup.join(', ')}" needs third-party proof on the landing page.`);
      if (platform === 'sklik' && titleCased(v)) add(f.label, 'error', 'Casing', 'Sklik needs Czech sentence case — only the first word and names capitalised.');
      for (const w of v.toLowerCase().split(/\s+/).filter((w) => w.length > 4)) {
        if (seen.has(w) && seen.get(w) !== f.label) add(f.label, 'warning', 'Repetition', `"${w}" repeats from ${seen.get(w)}.`);
        else seen.set(w, f.label);
      }
    } else {
      if (PERSONAL.test(v)) add(f.label, 'error', 'Personal attributes', 'Meta rejects text implying the reader has a personal condition or situation.');
      if (AGGRESSIVE.test(v)) add(f.label, 'error', 'Unrealistic claim', 'Guaranteed or unrealistic outcomes are rejected.');
      if (ex > 1) add(f.label, 'warning', 'Punctuation', 'Several exclamation marks look spammy.');
    }
  }
  if (platform === 'sklik' && exclaim > 1) add('Whole advert', 'error', 'Punctuation', `Sklik allows only one exclamation mark per advert (found ${exclaim}).`);
  return issues;
}

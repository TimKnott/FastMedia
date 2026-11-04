export const MAX_TITLE = 65;
const BRAND = /\s*[|—–-]\s*FastMedia(\.Pro)?\s*$/;

/** Append the brand only when it fits; long (often database) titles keep their keyword text intact. */
export function fitTitle(title: string): string {
  const t = title.trim();
  const core = t.replace(BRAND, '').trim();
  const branded = BRAND.test(t) ? t : `${core} | FastMedia.Pro`;
  return branded.length <= MAX_TITLE ? branded : core;
}

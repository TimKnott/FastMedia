export type PublicLanguage = 'cs' | 'en' | 'de';

export const languageLocales: Record<PublicLanguage, string> = { cs: 'cs-CZ', en: 'en-GB', de: 'de-DE' };
export const translatedPaths = ['/offer', '/contact'] as const;

export function isPublicLanguage(value: unknown): value is PublicLanguage {
  return value === 'cs' || value === 'en' || value === 'de';
}

export function pathLanguage(path: string): PublicLanguage | undefined {
  const segment = path.split('/')[1];
  return isPublicLanguage(segment) ? segment : undefined;
}

export function baseLanguagePath(path: string): string {
  return pathLanguage(path) ? path.replace(/^\/(cs|en|de)(?=\/|$)/, '') || '/' : path;
}

export function localizedPath(path: string, language: PublicLanguage): string {
  const base = baseLanguagePath(path);
  return translatedPaths.some(p => p === base) ? `/${language}${base}` : base;
}

export function initialLanguage(path: string, saved: unknown): PublicLanguage {
  return pathLanguage(path) ?? (isPublicLanguage(saved) ? saved : 'cs');
}
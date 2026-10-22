export interface LanguageAlternativeRow {
  language_code: string;
  slug: string;
  source_path: string;
}

/** Only published translated siblings; never guess the source page's language. */
export function languageAlternatives(rows: LanguageAlternativeRow[], sourcePath: string) {
  return rows.filter(row => row.source_path === sourcePath && /^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(row.language_code) && /^[a-z0-9][a-z0-9/-]*$/i.test(row.slug))
    .map(row => ({ language: row.language_code, path: `/l/${row.language_code}/${row.slug}` }));
}

export async function safeSeoFetch<T>(label: string, fetchRows: () => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try {
    const result = await fetchRows();
    if (result.error) throw new Error('Public content query failed');
    return result.data ?? [];
  } catch {
    console.warn(`[seo-routes] ${label} unavailable; omitted from this snapshot`);
    return [];
  }
}
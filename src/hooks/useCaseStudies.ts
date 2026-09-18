import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CaseStudyStat {
  value: string;
  label_cs: string;
  label_en: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  brand: string;
  tag_cs: string;
  tag_en: string;
  summary_cs: string;
  summary_en: string;
  body_cs: string;
  body_en: string;
  stats: CaseStudyStat[];
  thumbnail_url: string | null;
  pdf_url: string | null;
  pdf_path: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Generated Supabase types lag behind this table, so the client is cast locally.
const client = supabase as unknown as { from: (table: string) => any };

export const caseStudiesTable = () => client.from('case_studies');

export const fetchCaseStudies = async (includeHidden = false): Promise<CaseStudy[]> => {
  let query = client
    .from('case_studies')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (!includeHidden) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as CaseStudy[]).map((c) => ({
    ...c,
    stats: Array.isArray(c.stats) ? c.stats : [],
  }));
};

/** Published case studies, in the order set in the back office. */
export const usePublishedCaseStudies = () =>
  useQuery({ queryKey: ['case-studies', 'published'], queryFn: () => fetchCaseStudies(false) });

/** Every case study, including hidden ones (back office / signed-in staff). */
export const useAllCaseStudies = () =>
  useQuery({ queryKey: ['case-studies', 'all'], queryFn: () => fetchCaseStudies(true) });

type Lang = 'cs' | 'en' | string;

export const caseField = (
  item: CaseStudy,
  field: 'tag' | 'summary' | 'body',
  lang: Lang
): string => {
  const cs = (item as any)[`${field}_cs`] as string | undefined;
  const en = (item as any)[`${field}_en`] as string | undefined;
  if (lang === 'cs') return (cs || en || '').trim();
  return (en || cs || '').trim();
};

export const statLabel = (stat: CaseStudyStat, lang: Lang): string =>
  lang === 'cs' ? stat.label_cs || stat.label_en : stat.label_en || stat.label_cs;

/** Resolves a downloadable URL for a case study PDF (signed for stored files). */
export const resolvePdfUrl = async (item: CaseStudy): Promise<string | null> => {
  if (item.pdf_path) {
    const { data } = await supabase.storage
      .from('case-studies')
      .createSignedUrl(item.pdf_path, 60 * 60);
    if (data?.signedUrl) return data.signedUrl;
  }
  return item.pdf_url || null;
};

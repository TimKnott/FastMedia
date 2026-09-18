import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  slug: string;
  category: string;
  title_cs: string;
  title_en: string;
  subtitle_cs: string;
  subtitle_en: string;
  intro_cs: string;
  intro_en: string;
  learn_cs: string[];
  learn_en: string[];
  embed_url: string | null;
  embed_html: string | null;
  cover_image: string | null;
  level_label_cs: string;
  level_label_en: string;
  duration_label_cs: string;
  duration_label_en: string;
  is_free: boolean;
  price_czk: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const client = supabase as unknown as {
  from: (table: string) => any;
};

export const fetchCourses = async (includeHidden = false): Promise<Course[]> => {
  let query = client
    .from('courses')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (!includeHidden) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Course[];
};

/** Published courses for the public course area, already in admin-defined order. */
export const usePublishedCourses = () =>
  useQuery({ queryKey: ['courses', 'published'], queryFn: () => fetchCourses(false) });

/** Every course (including hidden ones) for the back office. */
export const useAllCourses = () =>
  useQuery({ queryKey: ['courses', 'all'], queryFn: () => fetchCourses(true) });

export const coursesTable = () => client.from('courses');

type Lang = 'cs' | 'en' | string;

export const courseField = (course: Course, field: 'title' | 'subtitle' | 'intro' | 'level_label' | 'duration_label', lang: Lang): string => {
  const cs = (course as any)[`${field}_cs`] as string | undefined;
  const en = (course as any)[`${field}_en`] as string | undefined;
  if (lang === 'cs') return (cs || en || '').trim();
  return (en || cs || '').trim();
};

export const courseLearn = (course: Course, lang: Lang): string[] => {
  const list = lang === 'cs' ? course.learn_cs : course.learn_en;
  const fallback = lang === 'cs' ? course.learn_en : course.learn_cs;
  return (list && list.length ? list : fallback ?? []).filter(Boolean);
};

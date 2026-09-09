import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost, BlogCategory, ContentBlock } from '@/data/blogPosts';
import fallbackImage from '@/assets/blog/blog-seo-tips.jpg';

type Lang = 'cs' | 'en' | 'de';
const LANGS: Lang[] = ['cs', 'en', 'de'];

const CATEGORY_MAP: Record<string, BlogCategory> = {
  webdesign: 'webdesign',
  'web-design': 'webdesign',
  design: 'webdesign',
  seo: 'seo',
  marketing: 'marketing',
  business: 'business',
  tips: 'tips',
};

type Localised = Partial<Record<Lang, string>>;

const localised = (value: unknown): { cs: string; en: string; de: string } => {
  const v = (value ?? {}) as Localised;
  const en = v.en ?? v.cs ?? v.de ?? '';
  return { cs: v.cs ?? en, en, de: v.de ?? en };
};

const localisedList = (value: unknown): { cs: string; en: string; de: string }[] => {
  const byLang: Record<Lang, string[]> = { cs: [], en: [], de: [] };
  const v = (value ?? {}) as Partial<Record<Lang, string[]>>;
  LANGS.forEach((l) => { byLang[l] = Array.isArray(v[l]) ? (v[l] as string[]) : []; });
  const len = Math.max(byLang.cs.length, byLang.en.length, byLang.de.length);
  return Array.from({ length: len }, (_, i) => {
    const en = byLang.en[i] ?? byLang.cs[i] ?? byLang.de[i] ?? '';
    return { cs: byLang.cs[i] ?? en, en, de: byLang.de[i] ?? en };
  });
};

/** Merge the per-language section arrays stored in the database into localised blocks. */
const toSections = (content: unknown): ContentBlock[] => {
  const c = (content ?? {}) as Record<Lang, { sections?: Record<string, unknown>[] } | undefined>;
  const base = c.en?.sections ?? c.cs?.sections ?? c.de?.sections ?? [];
  const blocks: ContentBlock[] = [];

  base.forEach((_, index) => {
    const per = (key: string) =>
      LANGS.reduce((acc, l) => {
        acc[l] = (c[l]?.sections?.[index] as Record<string, unknown> | undefined)?.[key];
        return acc;
      }, {} as Record<Lang, unknown>);

    const type = String((base[index] as Record<string, unknown>).type ?? 'paragraph');

    if (type === 'heading' || type === 'paragraph' || type === 'callout' || type === 'quote') {
      const texts = per('text') as Localised;
      blocks.push({ type: type as 'heading' | 'paragraph' | 'callout', text: localised(texts) } as ContentBlock);
      return;
    }

    if (type === 'list') {
      const items = per('items') as Partial<Record<Lang, string[]>>;
      blocks.push({ type: 'list', items: localisedList(items) });
      return;
    }

    if (type === 'howto') {
      blocks.push({ type: 'heading', text: localised(per('name') as Localised) });
      const description = localised(per('description') as Localised);
      if (description.en) blocks.push({ type: 'paragraph', text: description });
      const steps = LANGS.reduce((acc, l) => {
        const raw = (c[l]?.sections?.[index] as Record<string, unknown> | undefined)?.steps;
        acc[l] = Array.isArray(raw)
          ? raw.map((s) => (typeof s === 'string' ? s : String((s as Record<string, unknown>)?.text ?? '')))
          : [];
        return acc;
      }, {} as Record<Lang, string[]>);
      blocks.push({ type: 'list', items: localisedList(steps) });
      return;
    }

    const texts = per('text') as Localised;
    if (localised(texts).en) blocks.push({ type: 'paragraph', text: localised(texts) });
  });

  return blocks;
};

export const usePublishedBlogPosts = () =>
  useQuery({
    queryKey: ['published-blog-posts'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, content, category, hero_image_url, author, read_time_minutes, published_at, created_at, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: localised(row.title),
        excerpt: localised(row.excerpt),
        sections: toSections(row.content),
        category: CATEGORY_MAP[row.category] ?? 'tips',
        image: row.hero_image_url || fallbackImage,
        author: row.author || 'FastMedia.Pro',
        authorRole: { cs: 'Redakce', en: 'Editorial team', de: 'Redaktion' },
        date: (row.published_at ?? row.created_at ?? new Date().toISOString()).slice(0, 10),
        readTime: row.read_time_minutes ?? 5,
        tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      }));
    },
  });

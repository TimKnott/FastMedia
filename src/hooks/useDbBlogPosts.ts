import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BlogSection =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] };

export interface DbBlogPost {
  id: string;
  slug: string;
  category: string;
  hero_image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  author: string;
  read_time_minutes: number;
  title: { cs: string; en: string; de: string };
  excerpt: { cs: string; en: string; de: string };
  content: {
    cs: { sections: BlogSection[] };
    en: { sections: BlogSection[] };
    de: { sections: BlogSection[] };
  };
  tags: string[];
  ai_generated: boolean;
  auto_generated?: boolean;
  approval_status?: 'pending_review' | 'approved' | 'rejected' | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  audio_url?: string | null;
  audio_generated_at?: string | null;
  seo_keywords?: string[];
  faq_schema?: Record<string, unknown> | null;
  howto_schema?: Record<string, unknown> | null;
  generation_metadata?: Record<string, unknown> | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useDbBlogPosts = (
  options: { status?: 'draft' | 'published' | 'all'; pendingOnly?: boolean } = { status: 'published' },
) => {
  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    if (options.pendingOnly) {
      query = query.eq('approval_status', 'pending_review');
    }
    const { data, error: fetchErr } = await query;
    if (fetchErr) {
      setError(fetchErr.message);
      setPosts([]);
    } else {
      setPosts((data ?? []) as unknown as DbBlogPost[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.status, options.pendingOnly]);

  return { posts, loading, error, reload };
};

export const useDbBlogPost = (slug: string | undefined) => {
  const [post, setPost] = useState<DbBlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (!cancelled) {
        setPost((data ?? null) as unknown as DbBlogPost | null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return { post, loading };
};

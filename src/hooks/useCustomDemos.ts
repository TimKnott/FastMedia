import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomDemo {
  id: string;
  trade_id: string;
  icon: string;
  gradient: string;
  hero_image_url: string | null;
  gallery_images: string[];
  name: { cs: string; en: string; de: string };
  tagline: { cs: string; en: string; de: string };
  description: { cs: string; en: string; de: string };
  services: Array<{
    icon: string;
    title: { cs: string; en: string; de: string };
    description: { cs: string; en: string; de: string };
  }>;
  faqs: Array<{
    question: { cs: string; en: string; de: string };
    answer: { cs: string; en: string; de: string };
  }>;
  calculator_prompts: Array<{ cs: string; en: string; de: string }>;
  is_active: boolean;
  display_order: number;
}

export const useCustomDemos = (options: { activeOnly?: boolean } = { activeOnly: true }) => {
  const [demos, setDemos] = useState<CustomDemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    let query = supabase.from('custom_demos').select('*').order('created_at', { ascending: false });
    if (options.activeOnly) query = query.eq('is_active', true);
    const { data, error: fetchErr } = await query;
    if (fetchErr) {
      setError(fetchErr.message);
      setDemos([]);
    } else {
      setDemos((data ?? []) as unknown as CustomDemo[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.activeOnly]);

  return { demos, loading, error, reload };
};

export const useCustomDemo = (tradeId: string | undefined) => {
  const [demo, setDemo] = useState<CustomDemo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tradeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('custom_demos')
        .select('*')
        .eq('trade_id', tradeId)
        .eq('is_active', true)
        .maybeSingle();
      if (cancelled) return;
      if (fetchErr) {
        setError(fetchErr.message);
        setDemo(null);
      } else {
        setDemo((data ?? null) as unknown as CustomDemo | null);
        setError(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tradeId]);

  return { demo, loading, error };
};

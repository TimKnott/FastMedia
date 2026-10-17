import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PageSeo {
  title?: string | null;
  description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  og_type?: string | null;
  noindex?: boolean;
}

let seoCache: Record<string, PageSeo | null> = {};

export const usePageSeo = (pagePath: string) => {
  const { language } = useLanguage();
  const key = `${pagePath}__${language}`;
  const [seo, setSeo] = useState<PageSeo | null>(seoCache[key] ?? null);

  useEffect(() => {
    let active = true;
    setSeo(seoCache[key] ?? null);
    if (seoCache[key] !== undefined) {
      setSeo(seoCache[key]);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('page_seo')
        .select('title, description, og_title, og_description, og_image, og_type, noindex')
        .eq('page_path', pagePath)
        .eq('language', language)
        .maybeSingle();

      seoCache[key] = data ?? null;
      if (active) setSeo(data ?? null);
    })();
    return () => { active = false; };
  }, [pagePath, language, key]);

  return seo;
};

/** Clear cache so fresh data is fetched */
export const invalidatePageSeoCache = () => {
  seoCache = {};
};

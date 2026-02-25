import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

type ContentMap = Record<string, string>;

let globalCache: Record<string, ContentMap> = {};
let fetchPromise: Record<string, Promise<void>> = {};

/**
 * Fetches all site_content overrides for the current language.
 * Returns a lookup function: getContent(key, fallback) → string.
 */
export const useSiteContent = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState<ContentMap>(globalCache[language] ?? {});

  useEffect(() => {
    if (globalCache[language] && Object.keys(globalCache[language]).length > 0) {
      setContent(globalCache[language]);
      return;
    }

    if (!fetchPromise[language]) {
      fetchPromise[language] = (async () => {
        const { data } = await supabase
          .from('site_content')
          .select('content_key, value')
          .eq('language', language);
        const map: ContentMap = {};
        data?.forEach((row) => {
          map[row.content_key] = row.value;
        });
        globalCache[language] = map;
      })();
    }

    fetchPromise[language].then(() => {
      setContent(globalCache[language] ?? {});
    });
  }, [language]);

  const getContent = useCallback(
    (key: string, fallback: string) => content[key] ?? fallback,
    [content]
  );

  const invalidate = useCallback((key: string, value: string) => {
    globalCache[language] = { ...globalCache[language], [key]: value };
    setContent({ ...globalCache[language] });
  }, [language]);

  return { getContent, invalidate };
};

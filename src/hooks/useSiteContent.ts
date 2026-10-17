import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePreviewMode } from '@/contexts/PreviewModeContext';

type ContentMap = Record<string, string>;

let globalCache: Record<string, ContentMap> = {};
let fetchPromise: Record<string, Promise<void>> = {};

/**
 * Fetches site_content overrides for the current language.
 * In preview mode, draft values override published values.
 */
export const useSiteContent = () => {
  const { language } = useLanguage();
  const { isPreview } = usePreviewMode();
  const cacheKey = `${language}_${isPreview ? 'preview' : 'live'}`;
  const [content, setContent] = useState<ContentMap>(globalCache[cacheKey] ?? {});

  useEffect(() => {
    let active = true;
    setContent(globalCache[cacheKey] ?? {});
    if (globalCache[cacheKey] && Object.keys(globalCache[cacheKey]).length > 0) {
      setContent(globalCache[cacheKey]);
      return;
    }

    if (!fetchPromise[cacheKey]) {
      fetchPromise[cacheKey] = (async () => {
        // Always fetch published
        const { data: published } = await supabase
          .from('site_content')
          .select('content_key, value')
          .eq('language', language)
          .eq('status', 'published');

        const map: ContentMap = {};
        published?.forEach((row) => {
          map[row.content_key] = row.value;
        });

        // In preview mode, overlay drafts on top
        if (isPreview) {
          const { data: drafts } = await supabase
            .from('site_content')
            .select('content_key, value')
            .eq('language', language)
            .eq('status', 'draft');

          drafts?.forEach((row) => {
            map[row.content_key] = row.value;
          });
        }

        globalCache[cacheKey] = map;
      })();
    }

    fetchPromise[cacheKey].then(() => {
      if (active) setContent(globalCache[cacheKey] ?? {});
    });
    return () => { active = false; };
  }, [language, isPreview, cacheKey]);

  const getContent = useCallback(
    (key: string, fallback: string) => content[key] ?? fallback,
    [content]
  );

  const invalidate = useCallback((key: string, value: string) => {
    // Update preview cache
    const previewKey = `${language}_preview`;
    globalCache[previewKey] = { ...globalCache[previewKey], [key]: value };
    // Clear live cache so it refetches on publish
    delete fetchPromise[`${language}_live`];
    delete globalCache[`${language}_live`];
    setContent({ ...globalCache[cacheKey], [key]: value });
  }, [language, cacheKey]);

  return { getContent, invalidate };
};

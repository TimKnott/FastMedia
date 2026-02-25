import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePreviewMode } from '@/contexts/PreviewModeContext';

type ImageMap = Record<string, string>;

let imageCache: Record<string, ImageMap> = {};
let imageFetchPromise: Record<string, Promise<void>> = {};

/**
 * Fetches all site_content image overrides (language='all').
 * In preview mode, draft values override published values.
 */
export const useImageContent = () => {
  const { isPreview } = usePreviewMode();
  const cacheKey = isPreview ? 'preview' : 'live';
  const [content, setContent] = useState<ImageMap>(imageCache[cacheKey] ?? {});

  useEffect(() => {
    if (imageCache[cacheKey] && Object.keys(imageCache[cacheKey]).length > 0) {
      setContent(imageCache[cacheKey]);
      return;
    }

    if (!imageFetchPromise[cacheKey]) {
      imageFetchPromise[cacheKey] = (async () => {
        const { data: published } = await supabase
          .from('site_content')
          .select('content_key, value')
          .eq('language', 'all')
          .eq('status', 'published');

        const map: ImageMap = {};
        published?.forEach((row) => {
          map[row.content_key] = row.value;
        });

        if (isPreview) {
          const { data: drafts } = await supabase
            .from('site_content')
            .select('content_key, value')
            .eq('language', 'all')
            .eq('status', 'draft');

          drafts?.forEach((row) => {
            map[row.content_key] = row.value;
          });
        }

        imageCache[cacheKey] = map;
      })();
    }

    imageFetchPromise[cacheKey].then(() => {
      setContent({ ...imageCache[cacheKey] });
    });
  }, [isPreview, cacheKey]);

  const getImageUrl = useCallback(
    (key: string): string | undefined => content[key],
    [content]
  );

  const invalidateImage = useCallback((key: string, value: string) => {
    imageCache['preview'] = { ...imageCache['preview'], [key]: value };
    delete imageFetchPromise['live'];
    delete imageCache['live'];
    setContent({ ...imageCache[cacheKey], [key]: value });
  }, [cacheKey]);

  return { getImageUrl, invalidateImage };
};

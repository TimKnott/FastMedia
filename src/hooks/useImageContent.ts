import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ImageMap = Record<string, string>;

let imageCache: ImageMap = {};
let imageFetchPromise: Promise<void> | null = null;

/**
 * Fetches all site_content image overrides (language='all').
 * Returns a lookup: getImageUrl(key) → string | undefined
 */
export const useImageContent = () => {
  const [content, setContent] = useState<ImageMap>(imageCache);

  useEffect(() => {
    if (Object.keys(imageCache).length > 0) {
      setContent(imageCache);
      return;
    }

    if (!imageFetchPromise) {
      imageFetchPromise = (async () => {
        const { data } = await supabase
          .from('site_content')
          .select('content_key, value')
          .eq('language', 'all');
        const map: ImageMap = {};
        data?.forEach((row) => {
          map[row.content_key] = row.value;
        });
        imageCache = map;
      })();
    }

    imageFetchPromise.then(() => {
      setContent({ ...imageCache });
    });
  }, []);

  const getImageUrl = useCallback(
    (key: string): string | undefined => content[key],
    [content]
  );

  const invalidateImage = useCallback((key: string, value: string) => {
    imageCache = { ...imageCache, [key]: value };
    setContent({ ...imageCache });
  }, []);

  return { getImageUrl, invalidateImage };
};

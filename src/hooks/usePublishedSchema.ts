import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Approved JSON-LD blocks for a page, published from the AI Search Visibility workspace. */
export const usePublishedSchema = (pagePath?: string) =>
  useQuery({
    queryKey: ['published-schema', pagePath],
    enabled: !!pagePath,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await (supabase as unknown as { from: (n: string) => any })
        .from('geo_schema_blocks')
        .select('json_ld')
        .eq('page_path', pagePath)
        .eq('status', 'published');
      return ((data ?? []) as { json_ld: unknown }[]).map((d) => d.json_ld);
    },
  });

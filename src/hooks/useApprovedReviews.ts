import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PublicReview = {
  id: string;
  name: string;
  company: string | null;
  rating: number;
  review_text: string;
  approved_at: string | null;
};

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

/** Only real, admin-approved client reviews. Never includes emails. */
export function useApprovedReviews() {
  return useQuery({
    queryKey: ['approved_reviews'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('client_reviews')
        .select('id, name, company, rating, review_text, approved_at')
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as PublicReview[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

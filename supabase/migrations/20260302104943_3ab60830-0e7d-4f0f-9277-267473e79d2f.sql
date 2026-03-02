-- Drop the permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can read active embed codes" ON public.embed_codes;

-- Create a restrictive SELECT policy for admins only
CREATE POLICY "Admins can read embed codes"
  ON public.embed_codes
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
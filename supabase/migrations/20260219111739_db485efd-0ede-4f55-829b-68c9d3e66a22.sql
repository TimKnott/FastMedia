
-- Allow anon read access for admin panel (until real auth is implemented)
DROP POLICY "Authenticated users can view subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can view subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (true);

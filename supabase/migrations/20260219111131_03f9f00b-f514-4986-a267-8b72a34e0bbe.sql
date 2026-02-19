
-- Allow authenticated users (admins) to read newsletter subscribers
CREATE POLICY "Authenticated users can view subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

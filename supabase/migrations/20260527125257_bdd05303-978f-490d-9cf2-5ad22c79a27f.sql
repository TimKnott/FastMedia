
-- Tighten leads public insert
DROP POLICY IF EXISTS "Anyone can submit a lead via calculator" ON public.leads;
CREATE POLICY "Anyone can submit a lead via calculator"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(trim(email)) BETWEEN 5 AND 254
    AND email LIKE '%@%.%'
    AND name IS NOT NULL
    AND length(trim(name)) BETWEEN 1 AND 200
  );

-- Tighten newsletter public insert
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(trim(email)) BETWEEN 5 AND 254
    AND email LIKE '%@%.%'
  );

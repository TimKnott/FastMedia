CREATE TABLE public.client_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  company text CHECK (company IS NULL OR char_length(company) <= 120),
  email text NOT NULL CHECK (char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text NOT NULL CHECK (char_length(review_text) BETWEEN 10 AND 1500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);
GRANT INSERT ON public.client_reviews TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.client_reviews TO authenticated;
GRANT ALL ON public.client_reviews TO service_role;
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit pending review" ON public.client_reviews FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND approved_at IS NULL);
CREATE POLICY "Admins manage reviews" ON public.client_reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
-- Public view without emails
CREATE VIEW public.public_reviews WITH (security_invoker = false) AS
  SELECT id, name, company, rating, review_text, approved_at FROM public.client_reviews WHERE status = 'approved';
GRANT SELECT ON public.public_reviews TO anon, authenticated;
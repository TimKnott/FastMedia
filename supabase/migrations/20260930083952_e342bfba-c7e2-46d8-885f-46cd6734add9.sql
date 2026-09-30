DROP VIEW public.public_reviews;
GRANT SELECT (id, name, company, rating, review_text, approved_at, status) ON public.client_reviews TO anon;
CREATE POLICY "Public can read approved reviews" ON public.client_reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved');
REVOKE SELECT ON public.client_reviews FROM authenticated;
GRANT SELECT (id, name, company, rating, review_text, approved_at, status, created_at) ON public.client_reviews TO authenticated;
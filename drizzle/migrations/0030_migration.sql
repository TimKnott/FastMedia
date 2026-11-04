DROP POLICY IF EXISTS "Signed-in users read quote benchmarks" ON public.quote_benchmarks;
CREATE POLICY "Super admins read quote benchmarks" ON public.quote_benchmarks
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));
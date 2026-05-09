DROP POLICY IF EXISTS "Editors manage showcase" ON public.showcase_projects;

CREATE POLICY "Admins manage showcase"
  ON public.showcase_projects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
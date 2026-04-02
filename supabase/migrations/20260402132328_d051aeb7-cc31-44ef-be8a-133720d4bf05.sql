CREATE POLICY "Anon users cannot access attendance"
ON public.attendance AS RESTRICTIVE FOR ALL TO anon
USING (false) WITH CHECK (false);
CREATE POLICY "Case study files are readable"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'case-studies');

CREATE POLICY "Staff can upload case study files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-studies' AND (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Staff can update case study files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'case-studies' AND (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')))
WITH CHECK (bucket_id = 'case-studies' AND (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Staff can remove case study files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'case-studies' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));
CREATE POLICY "Admins manage outreach video files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'outreach-videos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'outreach-videos' AND public.has_role(auth.uid(), 'admin'));
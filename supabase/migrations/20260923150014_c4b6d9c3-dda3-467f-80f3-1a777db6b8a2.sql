DROP POLICY IF EXISTS "Case study files are readable" ON storage.objects;

CREATE POLICY "Published case study files are readable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'case-studies'
  AND EXISTS (
    SELECT 1 FROM public.case_studies c
    WHERE c.is_published = true
      AND (c.pdf_path = storage.objects.name OR c.thumbnail_url = storage.objects.name)
  )
);

CREATE POLICY "Staff can read all case study files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'case-studies'
  AND (
    public.has_role(auth.uid(), 'editor'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
);
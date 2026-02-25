-- Create a public storage bucket for site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true);

-- Allow anyone to read files
CREATE POLICY "Anyone can read site images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Only super_admins can upload/update/delete
CREATE POLICY "Super admins can upload site images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

CREATE POLICY "Super admins can update site images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-images'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

CREATE POLICY "Super admins can delete site images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-images'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);
-- Add storage policy to restrict file types in site-images bucket
-- Only allow image file types (JPEG, PNG, WebP, SVG, GIF)
CREATE POLICY "Only allow image file types"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images'
  AND (
    (storage.extension(name) = 'jpg') OR
    (storage.extension(name) = 'jpeg') OR
    (storage.extension(name) = 'png') OR
    (storage.extension(name) = 'webp') OR
    (storage.extension(name) = 'svg') OR
    (storage.extension(name) = 'gif')
  )
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);
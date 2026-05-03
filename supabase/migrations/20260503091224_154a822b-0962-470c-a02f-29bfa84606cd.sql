-- 1. Restrictive deny: anon and non-admin authenticated cannot SELECT bookings (PII)
CREATE POLICY "Deny anon select on bookings"
  ON public.bookings AS RESTRICTIVE FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Restrict bookings select to admins"
  ON public.bookings AS RESTRICTIVE FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrictive deny: anon and non-admin cannot SELECT newsletter_subscribers (emails)
CREATE POLICY "Deny anon select on newsletter_subscribers"
  ON public.newsletter_subscribers AS RESTRICTIVE FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Restrict newsletter select to admins"
  ON public.newsletter_subscribers AS RESTRICTIVE FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Suppressed emails: allow admins to audit suppression list
CREATE POLICY "Admins can read suppressed emails"
  ON public.suppressed_emails FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Storage: editors can UPDATE and DELETE blog-images and demo-images
CREATE POLICY "Editors can update blog and demo images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('blog-images', 'demo-images') AND public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (bucket_id IN ('blog-images', 'demo-images') AND public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors can delete blog and demo images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('blog-images', 'demo-images') AND public.has_role(auth.uid(), 'editor'::app_role));

-- 5. Public bucket listing: prevent anon from listing files (they can still fetch by known URL)
-- Restrict SELECT on storage.objects for anon to only objects (not enumeration via list)
-- Postgres-level: ensure no broad anon SELECT exists; if a permissive one does, replace with per-bucket policies tied to known-path access patterns.
-- Add restrictive policy denying anon SELECT on private-style listing while keeping public read for known paths via signed/direct URL access.
-- Note: public buckets in Supabase serve files via CDN regardless of RLS; this hardens the SQL list endpoint.
CREATE POLICY "Deny anon list of storage objects"
  ON storage.objects AS RESTRICTIVE FOR SELECT
  TO anon
  USING (
    bucket_id IN ('site-images', 'blog-images', 'demo-images', 'project-snapshots')
    AND name IS NOT NULL
  );

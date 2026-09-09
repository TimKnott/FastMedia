CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE WHEN coalesce(auth.role(), '') = 'anon' OR _user_id IS NULL THEN false
  ELSE EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        CASE ur.role
          WHEN 'super_admin' THEN 100
          WHEN 'admin' THEN 80
          WHEN 'moderator' THEN 60
          WHEN 'editor' THEN 40
          WHEN 'user' THEN 20
          ELSE 0
        END
      ) >= (
        CASE _role
          WHEN 'super_admin' THEN 100
          WHEN 'admin' THEN 80
          WHEN 'moderator' THEN 60
          WHEN 'editor' THEN 40
          WHEN 'user' THEN 20
          ELSE 0
        END
      )
  ) END
$$;

DROP POLICY IF EXISTS "Only allow image file types" ON storage.objects;
CREATE POLICY "Only allow image file types"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-images'
  AND storage.extension(name) IN ('jpg','jpeg','png','webp','svg','gif')
  AND public.has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Super admins can update site images" ON storage.objects;
CREATE POLICY "Super admins can update site images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Super admins can delete site images" ON storage.objects;
CREATE POLICY "Super admins can delete site images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Anon cannot access email send log" ON public.email_send_log;
CREATE POLICY "Anon cannot access email send log"
ON public.email_send_log AS RESTRICTIVE FOR ALL TO anon
USING (false) WITH CHECK (false);

REVOKE ALL ON public.email_send_log FROM anon;
REVOKE ALL ON public.inbound_emails FROM anon;
-- Table to store inline-editable content overrides
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  language text NOT NULL DEFAULT 'de',
  value text NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_key, language)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public site)
CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
USING (true);

-- Only super_admins can modify
CREATE POLICY "Super admins can manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
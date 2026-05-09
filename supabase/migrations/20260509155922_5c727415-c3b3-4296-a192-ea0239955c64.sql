CREATE TABLE public.showcase_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  lovable_url text NOT NULL,
  access_token text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.showcase_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon no access to showcase"
  ON public.showcase_projects AS RESTRICTIVE FOR ALL
  TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Editors manage showcase"
  ON public.showcase_projects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER showcase_projects_updated_at
  BEFORE UPDATE ON public.showcase_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_showcase_projects_slug ON public.showcase_projects(slug);
CREATE TABLE public.language_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL,
  language_name text NOT NULL,
  source_path text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','published','rejected')),
  reviewer_notes text,
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (language_code, slug)
);
GRANT SELECT ON public.language_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.language_versions TO authenticated;
GRANT ALL ON public.language_versions TO service_role;
ALTER TABLE public.language_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published language versions" ON public.language_versions FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all language versions" ON public.language_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update language versions" ON public.language_versions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete language versions" ON public.language_versions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER language_versions_updated BEFORE UPDATE ON public.language_versions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
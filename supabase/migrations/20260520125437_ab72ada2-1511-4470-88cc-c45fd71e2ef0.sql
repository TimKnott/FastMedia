CREATE TABLE IF NOT EXISTS public.seo_schema_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.seo_properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  page_type TEXT,
  is_blog BOOLEAN DEFAULT false,
  schemas_found JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  recommendation TEXT,
  audited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schema_audits_property ON public.seo_schema_audits(property_id, audited_at DESC);
CREATE INDEX IF NOT EXISTS idx_schema_audits_url ON public.seo_schema_audits(url);

ALTER TABLE public.seo_schema_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage schema audits" ON public.seo_schema_audits
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
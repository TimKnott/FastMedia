
-- SEO properties tracked in the dashboard
CREATE TABLE public.seo_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  last_eat_audit_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weekly performance snapshots from Search Console
CREATE TABLE public.seo_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.seo_properties(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('keyword','page','device','country','daily')),
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, week_start, dimension)
);
CREATE INDEX idx_seo_snapshots_property_week ON public.seo_snapshots(property_id, week_start DESC);

-- Per-URL index coverage results
CREATE TABLE public.seo_index_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.seo_properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  coverage_state TEXT,
  indexed BOOLEAN,
  last_crawl_time TIMESTAMPTZ,
  robots_txt_state TEXT,
  page_fetch_state TEXT,
  raw JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, url)
);

-- Sitemap status per property
CREATE TABLE public.seo_sitemaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.seo_properties(id) ON DELETE CASCADE,
  sitemap_url TEXT NOT NULL,
  last_submitted TIMESTAMPTZ,
  last_downloaded TIMESTAMPTZ,
  is_pending BOOLEAN DEFAULT false,
  errors INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  contents JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, sitemap_url)
);

-- E-A-T audit runs
CREATE TABLE public.eat_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.seo_properties(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0,
  expertise_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 0,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_eat_audits_property_run ON public.eat_audits(property_id, run_at DESC);

-- Issue queue
CREATE TABLE public.seo_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.seo_properties(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('critical','warning','info')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  suggested_fix TEXT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','snoozed','resolved')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ
);
CREATE INDEX idx_seo_issues_property_status ON public.seo_issues(property_id, status, severity);

-- updated_at trigger for seo_properties
CREATE TRIGGER trg_seo_properties_updated_at
  BEFORE UPDATE ON public.seo_properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.seo_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_index_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_sitemaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eat_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_issues ENABLE ROW LEVEL SECURITY;

-- RESTRICTIVE: deny anon entirely
CREATE POLICY "anon_no_seo_properties" ON public.seo_properties AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_seo_snapshots" ON public.seo_snapshots AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_seo_index_status" ON public.seo_index_status AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_seo_sitemaps" ON public.seo_sitemaps AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_eat_audits" ON public.eat_audits AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "anon_no_seo_issues" ON public.seo_issues AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

-- Admins manage everything
CREATE POLICY "admins_manage_seo_properties" ON public.seo_properties FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "admins_read_seo_snapshots" ON public.seo_snapshots FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "admins_read_seo_index_status" ON public.seo_index_status FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "admins_read_seo_sitemaps" ON public.seo_sitemaps FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "admins_read_eat_audits" ON public.eat_audits FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "admins_manage_seo_issues" ON public.seo_issues FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Service role can write snapshots, audits, etc. (cron / edge functions)
CREATE POLICY "service_role_writes_seo_snapshots" ON public.seo_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_writes_seo_index_status" ON public.seo_index_status FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_writes_seo_sitemaps" ON public.seo_sitemaps FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_writes_eat_audits" ON public.eat_audits FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_writes_seo_issues" ON public.seo_issues FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_writes_seo_properties" ON public.seo_properties FOR ALL TO service_role USING (true) WITH CHECK (true);


-- Extend seo_properties
ALTER TABLE public.seo_properties
  ADD COLUMN IF NOT EXISTS ga4_property_id text,
  ADD COLUMN IF NOT EXISTS alert_email text DEFAULT 'support@fastmedia.pro',
  ADD COLUMN IF NOT EXISTS pagespeed_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_pagespeed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_brokenlinks_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_freshness_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_backlinks_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_ga4_at timestamptz;

-- Backlinks snapshots
CREATE TABLE IF NOT EXISTS public.seo_backlinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  total_backlinks bigint DEFAULT 0,
  referring_domains bigint DEFAULT 0,
  authority_score numeric DEFAULT 0,
  follow_ratio numeric DEFAULT 0,
  top_anchors jsonb DEFAULT '[]'::jsonb,
  top_referring jsonb DEFAULT '[]'::jsonb,
  new_links bigint DEFAULT 0,
  lost_links bigint DEFAULT 0,
  spam_score numeric DEFAULT 0,
  snapshot_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_backlinks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_seo_backlinks" ON public.seo_backlinks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_backlinks" ON public.seo_backlinks AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_backlinks" ON public.seo_backlinks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Competitors
CREATE TABLE IF NOT EXISTS public.seo_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  competitor_domain text NOT NULL,
  source text DEFAULT 'auto',
  metrics jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_seo_competitors_prop_domain ON public.seo_competitors(property_id, competitor_domain);
ALTER TABLE public.seo_competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_manage_seo_competitors" ON public.seo_competitors FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_competitors" ON public.seo_competitors AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_competitors" ON public.seo_competitors FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Keyword gaps
CREATE TABLE IF NOT EXISTS public.seo_keyword_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  keyword text NOT NULL,
  competitor_domain text,
  competitor_position int,
  our_position int,
  volume int,
  kdi numeric,
  cpc numeric,
  discovered_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_keyword_gaps_prop ON public.seo_keyword_gaps(property_id, discovered_at DESC);
ALTER TABLE public.seo_keyword_gaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_seo_keyword_gaps" ON public.seo_keyword_gaps FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_keyword_gaps" ON public.seo_keyword_gaps AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_keyword_gaps" ON public.seo_keyword_gaps FOR ALL TO service_role USING (true) WITH CHECK (true);

-- PageSpeed / Core Web Vitals
CREATE TABLE IF NOT EXISTS public.seo_pagespeed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  url text NOT NULL,
  strategy text NOT NULL DEFAULT 'mobile',
  performance int,
  accessibility int,
  best_practices int,
  seo int,
  lcp_ms int,
  cls numeric,
  inp_ms int,
  fcp_ms int,
  ttfb_ms int,
  raw jsonb,
  audited_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_pagespeed_prop ON public.seo_pagespeed(property_id, audited_at DESC);
ALTER TABLE public.seo_pagespeed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_seo_pagespeed" ON public.seo_pagespeed FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_pagespeed" ON public.seo_pagespeed AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_pagespeed" ON public.seo_pagespeed FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Broken links
CREATE TABLE IF NOT EXISTS public.seo_broken_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  source_url text NOT NULL,
  target_url text NOT NULL,
  status_code int,
  error text,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_seo_broken_links_prop ON public.seo_broken_links(property_id, resolved_at);
ALTER TABLE public.seo_broken_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_manage_seo_broken_links" ON public.seo_broken_links FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_broken_links" ON public.seo_broken_links AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_broken_links" ON public.seo_broken_links FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Content freshness
CREATE TABLE IF NOT EXISTS public.seo_content_freshness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  url text NOT NULL,
  last_modified timestamptz,
  days_since_update int,
  word_count int,
  clicks_28d int DEFAULT 0,
  impressions_28d int DEFAULT 0,
  trend text,
  recommendation text,
  checked_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_seo_freshness_prop_url ON public.seo_content_freshness(property_id, url);
ALTER TABLE public.seo_content_freshness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_seo_content_freshness" ON public.seo_content_freshness FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_content_freshness" ON public.seo_content_freshness AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_content_freshness" ON public.seo_content_freshness FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Voice / question queries from GSC
CREATE TABLE IF NOT EXISTS public.seo_voice_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  query text NOT NULL,
  page text,
  clicks int DEFAULT 0,
  impressions int DEFAULT 0,
  position numeric,
  is_question boolean DEFAULT false,
  detected_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_voice_prop ON public.seo_voice_queries(property_id, detected_at DESC);
ALTER TABLE public.seo_voice_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_seo_voice_queries" ON public.seo_voice_queries FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_voice_queries" ON public.seo_voice_queries AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_voice_queries" ON public.seo_voice_queries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- GA4 snapshots
CREATE TABLE IF NOT EXISTS public.seo_ga4_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  week_start date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  top_pages jsonb DEFAULT '[]'::jsonb,
  high_exit_pages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_ga4_prop ON public.seo_ga4_snapshots(property_id, week_start DESC);
ALTER TABLE public.seo_ga4_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_seo_ga4_snapshots" ON public.seo_ga4_snapshots FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_ga4_snapshots" ON public.seo_ga4_snapshots AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_ga4_snapshots" ON public.seo_ga4_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Alert log
CREATE TABLE IF NOT EXISTS public.seo_alerts_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  subject text NOT NULL,
  body text,
  recipient text,
  status text NOT NULL DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_alerts_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_seo_alerts_log" ON public.seo_alerts_log FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "anon_no_seo_alerts_log" ON public.seo_alerts_log AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "service_role_writes_seo_alerts_log" ON public.seo_alerts_log FOR ALL TO service_role USING (true) WITH CHECK (true);

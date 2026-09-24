CREATE TABLE public.geo_business_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_key text NOT NULL UNIQUE,
  label text NOT NULL,
  value text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'website',
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid, verified_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.geo_locked_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE, reason text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.geo_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
  pages int NOT NULL DEFAULT 0, summary jsonb NOT NULL DEFAULT '{}'::jsonb, status text NOT NULL DEFAULT 'running'
);
CREATE TABLE public.geo_page_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.geo_audit_runs(id) ON DELETE CASCADE,
  url text NOT NULL, path text NOT NULL, http_status int,
  title text, description text, h1 text, word_count int,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  schema_types text[] NOT NULL DEFAULT '{}',
  headings jsonb NOT NULL DEFAULT '[]'::jsonb,
  internal_links int NOT NULL DEFAULT 0,
  text_excerpt text, content_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX geo_page_audits_run_idx ON public.geo_page_audits(run_id);
CREATE TABLE public.geo_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL, claim text NOT NULL, claim_type text NOT NULL,
  status text NOT NULL DEFAULT 'needs_review' CHECK (status IN ('needs_review','verified','remove','rewritten')),
  note text, reviewed_by uuid, reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (path, claim)
);
CREATE TABLE public.geo_content_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL, search_intent text, audience text, primary_question text,
  title text NOT NULL, url text, h1 text, outline jsonb NOT NULL DEFAULT '[]'::jsonb,
  internal_links jsonb NOT NULL DEFAULT '[]'::jsonb, required_facts jsonb NOT NULL DEFAULT '[]'::jsonb,
  schema_types text[] NOT NULL DEFAULT '{}', needs_approval boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'idea', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.geo_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, url text NOT NULL UNIQUE, notes text,
  report jsonb, analysed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.geo_generated_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL, target_path text, language text NOT NULL DEFAULT 'en',
  title text, facts jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_info jsonb NOT NULL DEFAULT '[]'::jsonb,
  before_content text, after_content text, json_ld jsonb,
  unverified boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','published','rejected')),
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.geo_schema_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL, schema_type text NOT NULL, json_ld jsonb NOT NULL,
  validated boolean NOT NULL DEFAULT false, validation_notes text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','published','rejected')),
  approved_by uuid, approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.geo_ai_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observed_on date NOT NULL, platform text NOT NULL, query text NOT NULL,
  country text NOT NULL, language text NOT NULL, device text NOT NULL,
  source_url text, cited boolean NOT NULL DEFAULT false, mentioned boolean NOT NULL DEFAULT false,
  quote text, screenshot_url text, recorded_by uuid, created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['geo_business_facts','geo_locked_pages','geo_audit_runs','geo_page_audits','geo_claims','geo_content_plan','geo_competitors','geo_generated_items','geo_schema_blocks','geo_ai_observations'] LOOP
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  EXECUTE format('CREATE POLICY "Staff view %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''editor''))', t);
  EXECUTE format('CREATE POLICY "Admins insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
  EXECUTE format('CREATE POLICY "Admins update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
  EXECUTE format('CREATE POLICY "Admins delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t);
END LOOP; END $$;

-- Published schema blocks are public so live pages can render them
GRANT SELECT ON public.geo_schema_blocks TO anon;
CREATE POLICY "Public read published schema" ON public.geo_schema_blocks FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE TRIGGER geo_generated_items_updated BEFORE UPDATE ON public.geo_generated_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER geo_schema_blocks_updated BEFORE UPDATE ON public.geo_schema_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER geo_business_facts_updated BEFORE UPDATE ON public.geo_business_facts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.geo_business_facts (fact_key, label, value, source, sort_order) VALUES
('business_name','Business name','FastMedia.Pro (operated by Timothy Knott)','website: footer / imprint',1),
('ico','Registration (IČO)','17308551','website: imprint',2),
('location','Registered location','Louny 440 01, Ústecký kraj, Czech Republic','website: imprint',3),
('phone','Phone','+420 797 864 432','website: contact',4),
('email','Email','support@fastmedia.pro','website: contact',5),
('url','Website','https://www.fastmedia.pro','website',6),
('services','Main products or services','Websites and templates for trades and local businesses; AI quote calculator; SEO; case studies; help preparing Kreativní vouchery grant applications (preparation only, not applying)','website: homepage, /offer, /service pages',7),
('customers','Target customers','Trades and small local businesses (47 industry templates listed)','website: demos',8),
('locations','Service locations','Czech Republic (online, worldwide delivery stated on site)','website',9),
('languages','Primary countries and languages','Czech (default), British English','website',10),
('competitors','Main competitors','','not on website — please add',11),
('differentiators','Important differentiators','Mobile-first; English-first service from a British national; 30-day full-refund guarantee','website: /offer',12),
('credentials','Verified credentials','','not on website — please add (no ISO or government-supplier claims until documented)',13),
('evidence','Customer evidence, reviews and case studies','Four case studies: Northwater, Lumière, Nordic, Summit (sample brands — confirm whether real clients)','website: /case-studies',14),
('tone','Preferred tone of voice','','please add',15),
('pricing','Pricing information','4-tier CZK packages (Starter to Enterprise) plus hosting; price list currently hidden','website: packages',16);
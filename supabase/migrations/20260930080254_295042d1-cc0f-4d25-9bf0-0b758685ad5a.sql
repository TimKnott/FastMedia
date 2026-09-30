CREATE TABLE public.backlink_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  site_name text NOT NULL,
  site_url text NOT NULL,
  submit_url text,
  category text NOT NULL,
  target_url text NOT NULL DEFAULT 'https://www.fastmedia.pro/',
  title_cs text, title_en text,
  short_cs text, short_en text,
  long_cs text, long_en text,
  notes text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','submitted','live','rejected')),
  live_url text,
  submitted_at timestamptz, live_at timestamptz,
  last_check_at timestamptz, last_check_result text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_url)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backlink_opportunities TO authenticated;
GRANT ALL ON public.backlink_opportunities TO service_role;
ALTER TABLE public.backlink_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage backlink opportunities" ON public.backlink_opportunities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_backlink_opps_updated BEFORE UPDATE ON public.backlink_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
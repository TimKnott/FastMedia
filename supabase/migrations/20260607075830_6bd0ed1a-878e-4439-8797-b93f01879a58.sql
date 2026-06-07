-- =============================================================
-- SEO Health Monitor: tables, RLS, grants, scheduled crawl
-- =============================================================

-- Enable scheduling extensions if not already (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ---------- seo_audit_runs ----------
CREATE TABLE IF NOT EXISTS public.seo_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  urls_checked integer NOT NULL DEFAULT 0,
  issues_found integer NOT NULL DEFAULT 0,
  health_score integer,
  triggered_by text NOT NULL DEFAULT 'cron',
  notes text
);

GRANT SELECT ON public.seo_audit_runs TO authenticated;
GRANT ALL ON public.seo_audit_runs TO service_role;

ALTER TABLE public.seo_audit_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read SEO audit runs"
  ON public.seo_audit_runs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------- seo_audit_findings ----------
CREATE TABLE IF NOT EXISTS public.seo_audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.seo_audit_runs(id) ON DELETE SET NULL,
  url text NOT NULL,
  check_id text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('high','medium','low')),
  current_value text,
  expected_value text,
  message text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  ignored_at timestamptz,
  ignored_reason text,
  ignored_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (url, check_id)
);

CREATE INDEX IF NOT EXISTS idx_seo_findings_open
  ON public.seo_audit_findings (severity, last_seen_at DESC)
  WHERE resolved_at IS NULL AND ignored_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_seo_findings_run
  ON public.seo_audit_findings (run_id);

GRANT SELECT, UPDATE ON public.seo_audit_findings TO authenticated;
GRANT ALL ON public.seo_audit_findings TO service_role;

ALTER TABLE public.seo_audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read SEO findings"
  ON public.seo_audit_findings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update SEO findings"
  ON public.seo_audit_findings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_seo_findings_updated_at ON public.seo_audit_findings;
CREATE TRIGGER trg_seo_findings_updated_at
  BEFORE UPDATE ON public.seo_audit_findings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Daily cron schedule ----------
-- Unschedule a previous version if it exists (safe no-op otherwise).
DO $$
BEGIN
  PERFORM cron.unschedule('seo-daily-audit');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'seo-daily-audit',
  '0 6 * * *',
  $$
    SELECT net.http_post(
      url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/seo-daily-audit',
      headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdm5uanNydXBtdWJjanNndWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTczOTUsImV4cCI6MjA4NzA3MzM5NX0.UDk0dkl0VsIB9gNqojTUZUqiDOM1-WCNST27ga9lHCA"}'::jsonb,
      body := jsonb_build_object('triggered_by','cron')
    ) AS request_id;
  $$
);
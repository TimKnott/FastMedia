ALTER TABLE public.backlink_opportunities ADD COLUMN IF NOT EXISTS link_ok boolean, ADD COLUMN IF NOT EXISTS is_own_site boolean NOT NULL DEFAULT false;
CREATE TABLE public.backlink_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.backlink_opportunities(id) ON DELETE CASCADE,
  checked_at timestamptz NOT NULL DEFAULT now(),
  found boolean NOT NULL,
  nofollow boolean NOT NULL DEFAULT false,
  result text
);
CREATE INDEX ON public.backlink_checks (checked_at DESC);
GRANT SELECT ON public.backlink_checks TO authenticated;
GRANT ALL ON public.backlink_checks TO service_role;
ALTER TABLE public.backlink_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read backlink checks" ON public.backlink_checks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
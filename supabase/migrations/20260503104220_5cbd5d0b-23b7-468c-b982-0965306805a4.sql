-- 1. Add columns to client_projects
ALTER TABLE public.client_projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS existing_website_url text,
  ADD COLUMN IF NOT EXISTS brand_color_secondary text,
  ADD COLUMN IF NOT EXISTS brand_notes text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'CZK',
  ADD COLUMN IF NOT EXISTS dev_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hosting_fee_yearly numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_token_ratio numeric NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS ai_cost_per_unit numeric NOT NULL DEFAULT 0.35,
  ADD COLUMN IF NOT EXISTS ai_units_per_user numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deposit_pct numeric NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS late_penalty_pct_per_day numeric NOT NULL DEFAULT 0.05,
  ADD COLUMN IF NOT EXISTS fee_line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS agreement_signed_off boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agreement_signed_off_at timestamptz,
  ADD COLUMN IF NOT EXISTS agreement_signed_off_by uuid;

-- 2. Backfill slug from name
UPDATE public.client_projects
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

-- 3. Unique index on slug (case-insensitive, non-null)
CREATE UNIQUE INDEX IF NOT EXISTS client_projects_slug_unique
  ON public.client_projects (slug)
  WHERE slug IS NOT NULL;

-- 4. Trigger: auto-generate slug if missing on insert
CREATE OR REPLACE FUNCTION public.client_projects_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  candidate text;
  n int := 1;
BEGIN
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    base_slug := lower(regexp_replace(regexp_replace(coalesce(NEW.name, 'project'), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'));
    IF base_slug = '' THEN base_slug := 'project'; END IF;
    candidate := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.client_projects WHERE slug = candidate AND id <> NEW.id) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_projects_set_slug ON public.client_projects;
CREATE TRIGGER trg_client_projects_set_slug
  BEFORE INSERT ON public.client_projects
  FOR EACH ROW EXECUTE FUNCTION public.client_projects_set_slug();

-- 5. Storage bucket for client brand assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-brand-assets', 'client-brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS for brand assets
DROP POLICY IF EXISTS "Public can read brand assets" ON storage.objects;
CREATE POLICY "Public can read brand assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-brand-assets');

DROP POLICY IF EXISTS "Editors can upload brand assets" ON storage.objects;
CREATE POLICY "Editors can upload brand assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'client-brand-assets' AND public.has_role(auth.uid(), 'editor'::app_role));

DROP POLICY IF EXISTS "Editors can update brand assets" ON storage.objects;
CREATE POLICY "Editors can update brand assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'client-brand-assets' AND public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (bucket_id = 'client-brand-assets' AND public.has_role(auth.uid(), 'editor'::app_role));

DROP POLICY IF EXISTS "Editors can delete brand assets" ON storage.objects;
CREATE POLICY "Editors can delete brand assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'client-brand-assets' AND public.has_role(auth.uid(), 'editor'::app_role));
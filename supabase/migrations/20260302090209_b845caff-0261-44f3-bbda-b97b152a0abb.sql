
-- Table for storing embed codes (analytics, tracking pixels, etc.)
CREATE TABLE public.embed_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  code text NOT NULL,
  placement text NOT NULL DEFAULT 'head' CHECK (placement IN ('head', 'body_start', 'body_end')),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.embed_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read active embed codes (needed for frontend injection)
CREATE POLICY "Anyone can read active embed codes"
  ON public.embed_codes FOR SELECT
  USING (is_active = true);

-- Only super_admins can manage embed codes
CREATE POLICY "Super admins can manage embed codes"
  ON public.embed_codes FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_embed_codes_updated_at
  BEFORE UPDATE ON public.embed_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

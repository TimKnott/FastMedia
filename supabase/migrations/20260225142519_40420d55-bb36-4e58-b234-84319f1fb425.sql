
-- Version history table for site_content
CREATE TABLE public.site_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  language text NOT NULL DEFAULT 'cs',
  value text NOT NULL,
  status text NOT NULL DEFAULT 'published',
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type text NOT NULL DEFAULT 'update', -- insert, update, delete, rollback
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_content_versions_key_lang ON public.site_content_versions (content_key, language, created_at DESC);

-- Enable RLS
ALTER TABLE public.site_content_versions ENABLE ROW LEVEL SECURITY;

-- Only admins can read version history
CREATE POLICY "Admins can view version history"
  ON public.site_content_versions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- System/trigger can insert (via security definer function)
CREATE POLICY "System can insert versions"
  ON public.site_content_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger function to auto-log versions
CREATE OR REPLACE FUNCTION public.log_site_content_version()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.site_content_versions (content_key, language, value, status, changed_by, change_type)
    VALUES (OLD.content_key, OLD.language, OLD.value, OLD.status, NEW.updated_by, 'update');
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.site_content_versions (content_key, language, value, status, changed_by, change_type)
    VALUES (OLD.content_key, OLD.language, OLD.value, OLD.status, OLD.updated_by, 'delete');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach trigger
CREATE TRIGGER trg_site_content_version
  BEFORE UPDATE OR DELETE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.log_site_content_version();

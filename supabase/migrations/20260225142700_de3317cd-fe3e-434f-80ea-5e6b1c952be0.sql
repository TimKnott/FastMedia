
CREATE TABLE public.page_seo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'cs',
  title TEXT,
  description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  noindex BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  UNIQUE (page_path, language)
);

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page SEO" ON public.page_seo
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage page SEO" ON public.page_seo
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_page_seo_updated_at
  BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

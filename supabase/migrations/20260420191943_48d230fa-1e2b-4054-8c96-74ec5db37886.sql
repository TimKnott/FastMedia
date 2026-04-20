-- ============ BLOG POSTS TABLE ============
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'web-design',
  hero_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  author TEXT NOT NULL DEFAULT 'FastMedia Editorial',
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  -- Trilingual content stored as JSONB { cs, en, de }
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  excerpt JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Editors can read all blog posts"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CUSTOM DEMOS TABLE ============
CREATE TABLE public.custom_demos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '🛠️',
  gradient TEXT NOT NULL DEFAULT 'bg-gradient-to-br from-primary/80 to-accent/80',
  hero_image_url TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Trilingual: { cs, en, de }
  name JSONB NOT NULL DEFAULT '{}'::jsonb,
  tagline JSONB NOT NULL DEFAULT '{}'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculator_prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 999,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE INDEX idx_custom_demos_active ON public.custom_demos(is_active);

ALTER TABLE public.custom_demos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active custom demos"
  ON public.custom_demos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Editors can read all custom demos"
  ON public.custom_demos FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors can manage custom demos"
  ON public.custom_demos FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER set_custom_demos_updated_at
  BEFORE UPDATE ON public.custom_demos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public)
  VALUES ('blog-images', 'blog-images', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('demo-images', 'demo-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Editors can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Service role can manage blog images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'blog-images')
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Public can read demo images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'demo-images');

CREATE POLICY "Editors can upload demo images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'demo-images' AND has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Service role can manage demo images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'demo-images')
  WITH CHECK (bucket_id = 'demo-images');
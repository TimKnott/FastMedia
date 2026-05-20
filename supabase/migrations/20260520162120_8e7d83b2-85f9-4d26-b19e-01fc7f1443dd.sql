
-- 1. Extend blog_posts with audio + approval + SEO schema fields
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS audio_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS seo_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq_schema jsonb,
  ADD COLUMN IF NOT EXISTS howto_schema jsonb,
  ADD COLUMN IF NOT EXISTS generation_metadata jsonb,
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS auto_generated boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_blog_posts_approval_status ON public.blog_posts(approval_status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_auto_generated ON public.blog_posts(auto_generated);

-- 2. Auto-generation job log
CREATE TABLE IF NOT EXISTS public.blog_generation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  topic text,
  keyword text,
  post_id uuid,
  model text,
  notes text,
  error text
);

ALTER TABLE public.blog_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY admins_read_blog_gen_log ON public.blog_generation_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY service_role_writes_blog_gen_log ON public.blog_generation_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY anon_no_blog_gen_log ON public.blog_generation_log
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

-- 3. Audio bucket (public so play button works without signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-audio', 'blog-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read blog audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-audio');

CREATE POLICY "Service role manages blog audio"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'blog-audio')
  WITH CHECK (bucket_id = 'blog-audio');

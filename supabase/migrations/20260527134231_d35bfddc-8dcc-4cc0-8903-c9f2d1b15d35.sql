
-- Allow scheduled posts: add explicit timestamp + 'scheduled' status
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamp with time zone;

-- Update the status check constraint to also allow 'scheduled'
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_status_check
  CHECK (status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'published'::text, 'archived'::text]));

CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_publish_at
  ON public.blog_posts (scheduled_publish_at)
  WHERE status = 'scheduled';

-- Auto-publish function: flips scheduled posts whose time has arrived
CREATE OR REPLACE FUNCTION public.publish_scheduled_blog_posts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flipped integer;
BEGIN
  WITH updated AS (
    UPDATE public.blog_posts
       SET status = 'published',
           published_at = COALESCE(published_at, now()),
           updated_at = now()
     WHERE status = 'scheduled'
       AND approval_status IN ('approved', 'pending_review')
       AND scheduled_publish_at IS NOT NULL
       AND scheduled_publish_at <= now()
     RETURNING 1
  )
  SELECT count(*) INTO flipped FROM updated;
  RETURN flipped;
END;
$$;

-- Update the public read policy so future-dated published posts stay hidden
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  );

-- Schedule auto-publish every 5 minutes (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  PERFORM cron.unschedule('publish-scheduled-blog-posts');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;
SELECT cron.schedule(
  'publish-scheduled-blog-posts',
  '*/5 * * * *',
  $$SELECT public.publish_scheduled_blog_posts();$$
);

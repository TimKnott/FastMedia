
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_blog_posts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_blog_posts() FROM anon;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_blog_posts() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.publish_scheduled_blog_posts() TO service_role;

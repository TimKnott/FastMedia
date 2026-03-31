
-- Fix search_path on functions we control that are missing it
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = 'public';
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = 'public';
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = 'public';
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = 'public';
ALTER FUNCTION public.audit_log_changes() SET search_path = 'public';

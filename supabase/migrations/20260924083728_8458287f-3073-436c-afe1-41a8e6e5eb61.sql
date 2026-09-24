
CREATE POLICY "Staff can read voice audio" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-audio' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor')));
CREATE POLICY "Service role manages voice audio" ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'voice-audio') WITH CHECK (bucket_id = 'voice-audio');

SELECT cron.schedule(
  'voice-daily-scan',
  '30 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/voice-daily-scan',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);

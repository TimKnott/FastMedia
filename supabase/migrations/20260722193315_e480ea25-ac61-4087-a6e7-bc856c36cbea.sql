DO $$
BEGIN
  PERFORM cron.unschedule('seo-daily-audit');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'seo-daily-audit',
  '0 6 * * *',
  $cron$
    SELECT net.http_post(
      url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/seo-daily-audit',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
        )
      ),
      body := jsonb_build_object('triggered_by','cron')
    ) AS request_id;
  $cron$
);
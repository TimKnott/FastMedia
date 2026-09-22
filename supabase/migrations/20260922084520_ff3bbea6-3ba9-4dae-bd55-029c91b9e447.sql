SELECT cron.schedule(
  'outreach-agent-hourly',
  '25 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/outreach-agent',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := jsonb_build_object('action','tick')
  );
  $$
);
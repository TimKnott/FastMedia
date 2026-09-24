ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_source_chk;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_source_chk
  CHECK (source = ANY (ARRAY['manual','import','enquiry','lead','visitor','getsales','discovery']));

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS discovered_query text;

ALTER TABLE public.outreach_settings
  ADD COLUMN IF NOT EXISTS discovery_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS discovery_trades text[] NOT NULL DEFAULT ARRAY['plumber','electrician','hair salon','dental clinic','restaurant','carpenter','fitness studio','accountant'],
  ADD COLUMN IF NOT EXISTS discovery_regions text[] NOT NULL DEFAULT ARRAY['Praha','Brno','Ostrava','Plzeň','Ústí nad Labem','Liberec','Olomouc','České Budějovice'],
  ADD COLUMN IF NOT EXISTS discovery_cursor integer NOT NULL DEFAULT 0;

SELECT cron.schedule(
  'prospect-discovery-weekly',
  '40 6 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/outreach-agent',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := jsonb_build_object('action','discover_weekly')
  );
  $$
);
INSERT INTO public.internal_job_tokens (name, token)
VALUES ('scheduled_jobs', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE j record; newcmd text;
BEGIN
  FOR j IN SELECT jobid, command FROM cron.job WHERE command ILIKE '%email_queue_service_role_key%' AND command NOT ILIKE '%process-email-queue%' LOOP
    newcmd := regexp_replace(j.command,
      '''Authorization''\s*,\s*''Bearer ''\s*\|\|\s*\(\s*SELECT decrypted_secret FROM vault\.decrypted_secrets WHERE name\s*=\s*''email_queue_service_role_key''\s*\)',
      '''x-job-token'', (SELECT token FROM public.internal_job_tokens WHERE name = ''scheduled_jobs'')', 'gi');
    PERFORM cron.alter_job(job_id := j.jobid, command := newcmd);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.flowlu_notify()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/flowlu-admin',
      headers := jsonb_build_object('Content-Type','application/json','x-job-token',
        (SELECT token FROM public.internal_job_tokens WHERE name = 'scheduled_jobs')),
      body := '{"action":"sync","limit":5}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NULL;
END; $function$;
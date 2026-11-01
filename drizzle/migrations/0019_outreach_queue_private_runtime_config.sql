-- lovable-cron-fallback-reviewed: Same bounded minute retry already explained (max 1440/day), wakes on approval and unschedules when queue drains; fixes inspected config schema mismatch.
CREATE TABLE public.outreach_queue_config(id integer PRIMARY KEY DEFAULT 1 CHECK(id=1), endpoint text NOT NULL);
GRANT ALL ON public.outreach_queue_config TO service_role;
ALTER TABLE public.outreach_queue_config ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.outreach_dispatch_queue() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE endpoint text; secret text;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
 IF NOT EXISTS(SELECT 1 FROM public.outreach_messages WHERE status='scheduled' AND approved_at IS NOT NULL AND dispatch_claimed_at IS NULL) THEN
 IF EXISTS(SELECT 1 FROM cron.job WHERE jobname='outreach-approved-queue') THEN PERFORM cron.unschedule('outreach-approved-queue'); END IF; RETURN;
 END IF;
 SELECT config.endpoint INTO endpoint FROM public.outreach_queue_config config WHERE id=1;
 SELECT token INTO secret FROM public.internal_job_tokens WHERE name='scheduled_jobs';
 IF endpoint IS NULL OR secret IS NULL THEN RETURN; END IF;
 PERFORM net.http_post(url:=endpoint,headers:=jsonb_build_object('Content-Type','application/json','x-job-token',secret),body:='{"action":"drip"}'::jsonb);
END $$;
CREATE OR REPLACE FUNCTION public.outreach_wake_queue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE endpoint text;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
 SELECT config.endpoint INTO endpoint FROM public.outreach_queue_config config WHERE id=1;
 IF endpoint IS NULL THEN RETURN NEW; END IF;
 IF EXISTS(SELECT 1 FROM public.outreach_messages WHERE status='scheduled' AND approved_at IS NOT NULL AND dispatch_claimed_at IS NULL) THEN
 IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='outreach-approved-queue') THEN PERFORM cron.schedule('outreach-approved-queue','* * * * *','SELECT public.outreach_dispatch_queue();'); END IF;
 IF NEW.status='scheduled' AND NEW.approved_at IS NOT NULL AND NEW.scheduled_at<=now() THEN PERFORM public.outreach_dispatch_queue(); END IF;
 ELSE
 IF EXISTS(SELECT 1 FROM cron.job WHERE jobname='outreach-approved-queue') THEN PERFORM cron.unschedule('outreach-approved-queue'); END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.outreach_dispatch_queue(),public.outreach_wake_queue() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.outreach_dispatch_queue(),public.outreach_wake_queue() TO service_role;
-- lovable-cron-fallback-reviewed: Approval wakes immediately; minute retry exists only while approved unclaimed queue records remain and unschedules after drain. Maximum 1440/day cost explained; no delay-until provider available.
CREATE TABLE public.outreach_worker_lease(id integer PRIMARY KEY DEFAULT 1 CHECK(id=1), token uuid, expires_at timestamptz);
GRANT ALL ON public.outreach_worker_lease TO service_role;
ALTER TABLE public.outreach_worker_lease ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.outreach_acquire_worker(_token uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.outreach_worker_lease(id,token,expires_at) VALUES(1,_token,now()+interval '10 minutes') ON CONFLICT(id) DO UPDATE SET token=EXCLUDED.token,expires_at=EXCLUDED.expires_at WHERE outreach_worker_lease.expires_at<=now() OR outreach_worker_lease.token IS NULL;
 RETURN FOUND;
END $$;
CREATE OR REPLACE FUNCTION public.outreach_release_worker(_token uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ UPDATE public.outreach_worker_lease SET token=NULL,expires_at=NULL WHERE id=1 AND token=_token; $$;
REVOKE ALL ON FUNCTION public.outreach_acquire_worker(uuid),public.outreach_release_worker(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.outreach_acquire_worker(uuid),public.outreach_release_worker(uuid) TO service_role;
ALTER TABLE public.outreach_messages ADD COLUMN dispatch_claimed_at timestamptz;
COMMENT ON COLUMN public.outreach_messages.dispatch_claimed_at IS 'Conditional provider-dispatch claim. Never automatically clear uncertain sends; prevents duplicate dispatch after worker expiry.';
CREATE OR REPLACE FUNCTION public.outreach_dispatch_queue() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE endpoint text; secret text;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
 IF NOT EXISTS(SELECT 1 FROM public.outreach_messages WHERE status='scheduled' AND approved_at IS NOT NULL AND dispatch_claimed_at IS NULL) THEN
 IF EXISTS(SELECT 1 FROM cron.job WHERE jobname='outreach-approved-queue') THEN PERFORM cron.unschedule('outreach-approved-queue'); END IF; RETURN;
 END IF;
 SELECT value INTO endpoint FROM public.site_settings WHERE key='outreach_queue_endpoint';
 SELECT token INTO secret FROM public.internal_job_tokens WHERE name='scheduled_jobs';
 IF endpoint IS NULL OR secret IS NULL THEN RETURN; END IF;
 PERFORM net.http_post(url:=endpoint,headers:=jsonb_build_object('Content-Type','application/json','x-job-token',secret),body:='{"action":"drip"}'::jsonb);
END $$;
CREATE OR REPLACE FUNCTION public.outreach_wake_queue() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE endpoint text;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000002);
 SELECT value INTO endpoint FROM public.site_settings WHERE key='outreach_queue_endpoint';
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
CREATE TRIGGER outreach_approved_queue_wake AFTER INSERT OR UPDATE OF status,approved_at,scheduled_at,dispatch_claimed_at ON public.outreach_messages FOR EACH ROW EXECUTE FUNCTION public.outreach_wake_queue();
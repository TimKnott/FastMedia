CREATE OR REPLACE FUNCTION public.outreach_verify_queue() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pid uuid; mid uuid; a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); report jsonb;
BEGIN
 PERFORM public.repository_assert_admin();
 BEGIN
 IF NOT public.outreach_acquire_worker(a) THEN RAISE EXCEPTION 'Worker busy; retry diagnostic later'; END IF;
 IF public.outreach_acquire_worker(b) THEN RAISE EXCEPTION 'Concurrent worker bypass'; END IF;
 PERFORM public.outreach_release_worker(b);
 IF public.outreach_acquire_worker(b) THEN RAISE EXCEPTION 'Foreign lease release bypass'; END IF;
 PERFORM public.outreach_release_worker(a);
 INSERT INTO public.prospects(company,email,status) VALUES('Rollback-only queue QA','queue-qa@example.invalid','approved') RETURNING id INTO pid;
 INSERT INTO public.outreach_messages(prospect_id,subject,body,status,approved_at,scheduled_at) VALUES(pid,'Rollback-only QA','Never dispatch','scheduled',now(),now()) RETURNING id INTO mid;
 IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='outreach-approved-queue' AND schedule='* * * * *' AND active) THEN RAISE EXCEPTION 'Queue scheduler did not arm'; END IF;
 IF NOT EXISTS(SELECT 1 FROM net.http_request_queue WHERE body LIKE '%drip%') THEN RAISE EXCEPTION 'Immediate wake did not enqueue'; END IF;
 UPDATE public.outreach_messages SET status='cancelled' WHERE id=mid;
 IF NOT EXISTS(SELECT 1 FROM public.outreach_messages WHERE status='scheduled' AND approved_at IS NOT NULL AND dispatch_claimed_at IS NULL) AND EXISTS(SELECT 1 FROM cron.job WHERE jobname='outreach-approved-queue') THEN RAISE EXCEPTION 'Queue scheduler did not drain'; END IF;
 report:='{"concurrent_worker_blocked":true,"foreign_release_blocked":true,"minute_scheduler_armed":true,"approval_wakes_immediately":true,"drain_unschedules":true,"no_external_requests_committed":true}'::jsonb;
 RAISE EXCEPTION USING ERRCODE='ZQ003',MESSAGE='Rollback QA';
 EXCEPTION WHEN SQLSTATE 'ZQ003' THEN RETURN report; END;
END $$;
REVOKE ALL ON FUNCTION public.outreach_verify_queue() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.outreach_verify_queue() TO authenticated;
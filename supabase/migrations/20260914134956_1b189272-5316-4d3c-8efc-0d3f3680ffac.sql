ALTER TABLE public.tracker_items DROP CONSTRAINT IF EXISTS tracker_items_source_chk;
ALTER TABLE public.tracker_items ADD CONSTRAINT tracker_items_source_chk CHECK (source IN ('manual','enquiry','lead','grant-followup'));
ALTER TABLE public.tracker_items DROP CONSTRAINT IF EXISTS tracker_items_stage_chk;
ALTER TABLE public.tracker_items ADD CONSTRAINT tracker_items_stage_chk CHECK (stage IN ('new','contacted','quoted','won','lost','in_progress','waiting_on_client','done','docs_pending','application_ready','submitted_dpmk'));
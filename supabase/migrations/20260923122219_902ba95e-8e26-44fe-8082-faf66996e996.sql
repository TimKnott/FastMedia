ALTER TABLE public.outreach_settings
  ADD COLUMN IF NOT EXISTS getsales_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS getsales_base_url text,
  ADD COLUMN IF NOT EXISTS getsales_list_id text,
  ADD COLUMN IF NOT EXISTS getsales_sender_id text,
  ADD COLUMN IF NOT EXISTS getsales_automation_id text;

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS getsales_lead_id text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS getsales_synced_at timestamp with time zone;

ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_source_chk;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_source_chk
  CHECK (source = ANY (ARRAY['manual'::text, 'import'::text, 'enquiry'::text, 'lead'::text, 'visitor'::text, 'getsales'::text]));

CREATE INDEX IF NOT EXISTS prospects_getsales_lead_id_idx ON public.prospects (getsales_lead_id);
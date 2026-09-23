ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS getsales_sync_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS getsales_sync_error text,
  ADD COLUMN IF NOT EXISTS getsales_sync_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS getsales_last_attempt_at timestamp with time zone;

ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_getsales_sync_status_chk;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_getsales_sync_status_chk
  CHECK (getsales_sync_status = ANY (ARRAY['none'::text, 'synced'::text, 'failed'::text, 'retrying'::text]));
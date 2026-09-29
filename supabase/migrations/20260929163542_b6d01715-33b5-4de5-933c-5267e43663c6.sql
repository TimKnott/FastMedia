ALTER TABLE public.outreach_settings
  ADD COLUMN IF NOT EXISTS discovery_spend_date date,
  ADD COLUMN IF NOT EXISTS discovery_spend_credits numeric NOT NULL DEFAULT 0;
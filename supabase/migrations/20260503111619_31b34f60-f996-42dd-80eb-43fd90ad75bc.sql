ALTER TABLE public.client_projects
  ADD COLUMN IF NOT EXISTS agreement_signed_off_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deposit_paid_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS draft_emailed_at TIMESTAMPTZ;
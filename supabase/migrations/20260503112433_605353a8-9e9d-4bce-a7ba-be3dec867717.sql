ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS budget_range text;

CREATE INDEX IF NOT EXISTS idx_leads_budget_range ON public.leads (budget_range);
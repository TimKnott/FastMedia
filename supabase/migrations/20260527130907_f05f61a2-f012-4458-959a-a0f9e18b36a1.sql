ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS campaign_name text;
CREATE INDEX IF NOT EXISTS idx_coupons_campaign ON public.coupons(campaign_name) WHERE campaign_name IS NOT NULL;
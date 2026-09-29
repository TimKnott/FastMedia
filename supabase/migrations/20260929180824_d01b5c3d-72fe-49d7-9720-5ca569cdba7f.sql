ALTER TABLE public.flowlu_leads ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'scored', ADD COLUMN IF NOT EXISTS last_reply_at timestamptz, ADD COLUMN IF NOT EXISTS last_contact_at timestamptz, ADD COLUMN IF NOT EXISTS emails_sent integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS flowlu_score_synced text;
CREATE TABLE public.flowlu_lead_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flowlu_lead_id bigint NOT NULL,
  step integer NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','sent','cancelled','failed')),
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (flowlu_lead_id, step)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flowlu_lead_sequences TO authenticated;
GRANT ALL ON public.flowlu_lead_sequences TO service_role;
ALTER TABLE public.flowlu_lead_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sequences" ON public.flowlu_lead_sequences FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER flowlu_lead_sequences_updated BEFORE UPDATE ON public.flowlu_lead_sequences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
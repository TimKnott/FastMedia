
-- Lead scoring classification enum
CREATE TYPE public.lead_classification AS ENUM ('cold', 'warm', 'hot', 'high_priority');

-- Lead status pipeline enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- =============================================
-- LEADS TABLE - Core lead data
-- =============================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  trade TEXT NOT NULL,
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  
  -- Scoring
  score INTEGER NOT NULL DEFAULT 0,
  classification lead_classification NOT NULL DEFAULT 'cold',
  
  -- Pipeline
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to TEXT,
  
  -- Calculator data (structured JSON)
  selected_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  special_request TEXT,
  quote_one_time INTEGER NOT NULL DEFAULT 0,
  quote_monthly INTEGER NOT NULL DEFAULT 0,
  labor_hours NUMERIC(6,1) NOT NULL DEFAULT 0,
  
  -- AI analysis
  ai_analysis JSONB,
  
  -- Metadata
  source TEXT NOT NULL DEFAULT 'calculator',
  language TEXT NOT NULL DEFAULT 'en',
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LEAD SCORE HISTORY - Track score changes over time
-- =============================================
CREATE TABLE public.lead_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  old_score INTEGER NOT NULL DEFAULT 0,
  new_score INTEGER NOT NULL,
  old_classification lead_classification,
  new_classification lead_classification NOT NULL,
  reason TEXT,
  scored_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LEAD NOTES - Internal comments per lead
-- =============================================
CREATE TABLE public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LEAD ACTIVITIES - Timeline of events
-- =============================================
CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'created', 'status_changed', 'score_updated', 'email_sent', 'note_added', 'assigned'
  description TEXT NOT NULL,
  metadata JSONB,
  performed_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SCORING RULES - Configurable scoring weights
-- =============================================
CREATE TABLE public.scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_category TEXT NOT NULL, -- 'feature_count', 'budget', 'trade', 'urgency', 'feature_type'
  condition JSONB NOT NULL, -- e.g. {"min_features": 5} or {"trade": "plumbing"}
  points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- EMAIL LOG - Track emails sent to leads
-- =============================================
CREATE TABLE public.lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'quote_results', 'follow_up', 'custom'
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
  metadata JSONB
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_classification ON public.leads(classification);
CREATE INDEX idx_leads_score ON public.leads(score DESC);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_lead_score_history_lead_id ON public.lead_score_history(lead_id);
CREATE INDEX idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_emails_lead_id ON public.lead_emails(lead_id);

-- =============================================
-- RLS - All tables admin-only
-- =============================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;

-- Leads: admin full access, anon can INSERT (for calculator submissions)
CREATE POLICY "Admins can manage leads"
  ON public.leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit a lead via calculator"
  ON public.leads FOR INSERT TO anon
  WITH CHECK (true);

-- Score history: admin only
CREATE POLICY "Admins can manage score history"
  ON public.lead_score_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notes: admin only
CREATE POLICY "Admins can manage notes"
  ON public.lead_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Activities: admin only
CREATE POLICY "Admins can manage activities"
  ON public.lead_activities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Scoring rules: admin only
CREATE POLICY "Admins can manage scoring rules"
  ON public.scoring_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Email log: admin only
CREATE POLICY "Admins can manage email log"
  ON public.lead_emails FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS - Auto-update timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scoring_rules_updated_at
  BEFORE UPDATE ON public.scoring_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DEFAULT SCORING RULES
-- =============================================
INSERT INTO public.scoring_rules (rule_name, rule_category, condition, points) VALUES
  ('5+ features selected', 'feature_count', '{"min_features": 5}', 15),
  ('8+ features selected', 'feature_count', '{"min_features": 8}', 25),
  ('Premium feature selected', 'feature_type', '{"category": "premium"}', 20),
  ('E-commerce selected', 'feature_type', '{"feature_id": "ecommerce"}', 30),
  ('CRM selected', 'feature_type', '{"feature_id": "crm"}', 25),
  ('Budget over 20k CZK', 'budget', '{"min_total": 20000}', 15),
  ('Budget over 40k CZK', 'budget', '{"min_total": 40000}', 30),
  ('Budget over 80k CZK', 'budget', '{"min_total": 80000}', 40),
  ('Booking system selected', 'feature_type', '{"feature_id": "booking-system"}', 10),
  ('Has special request', 'urgency', '{"has_special_request": true}', 10);

-- Fix RLS policies: convert RESTRICTIVE to PERMISSIVE so they actually grant access.

-- ===== leads =====
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can submit a lead via calculator" ON public.leads;

CREATE POLICY "Admins can manage leads"
  ON public.leads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit a lead via calculator"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- ===== bookings =====
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;

CREATE POLICY "Admins can manage bookings"
  ON public.bookings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== newsletter_subscribers =====
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Admins can manage subscribers"
  ON public.newsletter_subscribers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- ===== audit_logs =====
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ===== lead_activities =====
DROP POLICY IF EXISTS "Admins can manage activities" ON public.lead_activities;

CREATE POLICY "Admins can manage activities"
  ON public.lead_activities FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== lead_emails =====
DROP POLICY IF EXISTS "Admins can manage email log" ON public.lead_emails;

CREATE POLICY "Admins can manage email log"
  ON public.lead_emails FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== lead_notes =====
DROP POLICY IF EXISTS "Admins can manage notes" ON public.lead_notes;

CREATE POLICY "Admins can manage notes"
  ON public.lead_notes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== lead_score_history =====
DROP POLICY IF EXISTS "Admins can manage score history" ON public.lead_score_history;

CREATE POLICY "Admins can manage score history"
  ON public.lead_score_history FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== scoring_rules =====
DROP POLICY IF EXISTS "Admins can manage scoring rules" ON public.scoring_rules;

CREATE POLICY "Admins can manage scoring rules"
  ON public.scoring_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== user_roles =====
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);
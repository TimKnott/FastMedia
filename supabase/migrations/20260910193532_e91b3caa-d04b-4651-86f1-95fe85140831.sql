-- Scope admin policies to authenticated role only
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can read embed codes" ON public.embed_codes;
CREATE POLICY "Admins can read embed codes" ON public.embed_codes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Super admins can manage embed codes" ON public.embed_codes;
CREATE POLICY "Super admins can manage embed codes" ON public.embed_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage activities" ON public.lead_activities;
CREATE POLICY "Admins can manage activities" ON public.lead_activities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage email log" ON public.lead_emails;
CREATE POLICY "Admins can manage email log" ON public.lead_emails FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage notes" ON public.lead_notes;
CREATE POLICY "Admins can manage notes" ON public.lead_notes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage score history" ON public.lead_score_history;
CREATE POLICY "Admins can manage score history" ON public.lead_score_history FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Super admins can manage page SEO" ON public.page_seo;
CREATE POLICY "Super admins can manage page SEO" ON public.page_seo FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage scoring rules" ON public.scoring_rules;
CREATE POLICY "Admins can manage scoring rules" ON public.scoring_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Legal docs: anon sees published only; authenticated editors also see drafts
DROP POLICY IF EXISTS "Public can read published legal docs" ON public.legal_documents;
CREATE POLICY "Anon can read published legal docs" ON public.legal_documents FOR SELECT TO anon USING (published = true);
CREATE POLICY "Users can read published legal docs" ON public.legal_documents FOR SELECT TO authenticated USING (published = true OR public.has_role(auth.uid(), 'editor'::app_role));

-- Remove anonymous execute on the SECURITY DEFINER role helper
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- seo_audit_findings
CREATE POLICY "restrict_seo_audit_findings_admin_only" ON public.seo_audit_findings
  AS RESTRICTIVE FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "deny_anon_seo_audit_findings" ON public.seo_audit_findings
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

-- seo_audit_runs
CREATE POLICY "restrict_seo_audit_runs_admin_only" ON public.seo_audit_runs
  AS RESTRICTIVE FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "deny_anon_seo_audit_runs" ON public.seo_audit_runs
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

-- seo_schema_audits
CREATE POLICY "restrict_seo_schema_audits_admin_only" ON public.seo_schema_audits
  AS RESTRICTIVE FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "deny_anon_seo_schema_audits" ON public.seo_schema_audits
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

-- site_content_versions
CREATE POLICY "restrict_site_content_versions_admin_only" ON public.site_content_versions
  AS RESTRICTIVE FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "deny_anon_site_content_versions" ON public.site_content_versions
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

-- super_admin_allowlist
CREATE POLICY "restrict_super_admin_allowlist_superadmin_only" ON public.super_admin_allowlist
  AS RESTRICTIVE FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "deny_anon_super_admin_allowlist" ON public.super_admin_allowlist
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

ALTER TABLE public.lead_repository_emails ADD COLUMN imported_compliance jsonb NOT NULL DEFAULT '[]';
COMMENT ON COLUMN public.lead_repository_emails.imported_compliance IS 'Complete linked compliance_review source rows; untrusted imported evidence, never legal approval. Manual review is stored separately in review.';
CREATE OR REPLACE FUNCTION public.repository_link_imported_compliance() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 SELECT coalesce(jsonb_agg(source),'[]'::jsonb) INTO NEW.imported_compliance FROM jsonb_array_elements(NEW.source_rows) source WHERE source->>'kind'='compliance_review';
 IF TG_OP='INSERT' THEN
 NEW.review:=jsonb_build_object('lawful_basis','unassessed','channel_permission','unassessed');
 NEW.compliance_status:='UNASSESSED'; NEW.campaign_status:='HOLD'; NEW.reviewed_by:=NULL; NEW.reviewed_at:=NULL;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER repository_imported_compliance BEFORE INSERT OR UPDATE OF source_rows ON public.lead_repository_emails FOR EACH ROW EXECUTE FUNCTION public.repository_link_imported_compliance();
CREATE OR REPLACE FUNCTION public.repository_preserve_objection_review() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.review IS DISTINCT FROM OLD.review THEN
 NEW.review:=NEW.review || (SELECT coalesce(jsonb_object_agg(key,value),'{}'::jsonb) FROM jsonb_each(OLD.review) WHERE key IN ('objected_at','unsubscribed_at'));
 END IF;
 IF EXISTS(SELECT 1 FROM public.suppressed_emails WHERE lower(trim(email))=NEW.email) THEN NEW.compliance_status:='SUPPRESSED'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER repository_preserve_objection BEFORE UPDATE ON public.lead_repository_emails FOR EACH ROW EXECUTE FUNCTION public.repository_preserve_objection_review();
CREATE OR REPLACE FUNCTION public.repository_list(_filters jsonb,_page integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; total bigint; BEGIN
 PERFORM public.repository_assert_admin();
 WITH matching AS (SELECT l.* FROM public.lead_repository_leads l WHERE
 (coalesce(_filters->>'search','')='' OR l.person_name ILIKE '%'||(_filters->>'search')||'%' OR l.company ILIKE '%'||(_filters->>'search')||'%') AND
 (coalesce(_filters->>'company','')='' OR l.company ILIKE '%'||(_filters->>'company')||'%') AND
 (coalesce(_filters->>'industry','')='' OR l.industry ILIKE '%'||(_filters->>'industry')||'%') AND
 (coalesce(_filters->>'location','')='' OR l.location ILIKE '%'||(_filters->>'location')||'%') AND
 (coalesce(_filters->>'segment','')='' OR lower(l.segment) LIKE '%'||lower(_filters->>'segment')||'%') AND
 (coalesce(_filters->>'validation','')='' OR EXISTS(SELECT 1 FROM public.lead_repository_emails e WHERE e.lead_id=l.id AND e.validation_status ILIKE '%'||(_filters->>'validation')||'%')) AND
 (coalesce(_filters->>'compliance','')='' OR EXISTS(SELECT 1 FROM public.lead_repository_emails e WHERE e.lead_id=l.id AND CASE WHEN EXISTS(SELECT 1 FROM public.suppressed_emails s WHERE lower(trim(s.email))=e.email) THEN 'SUPPRESSED' ELSE e.compliance_status END=(_filters->>'compliance'))))
 SELECT jsonb_build_object('total',(SELECT count(*) FROM matching),'rows',coalesce((SELECT jsonb_agg(to_jsonb(p) || jsonb_build_object('emails',(SELECT coalesce(jsonb_agg(to_jsonb(e) || jsonb_build_object('globally_suppressed',EXISTS(SELECT 1 FROM public.suppressed_emails s WHERE lower(trim(s.email))=e.email))),'[]') FROM public.lead_repository_emails e WHERE e.lead_id=p.id))) FROM (SELECT * FROM matching ORDER BY created_at DESC,id LIMIT 25 OFFSET greatest(0,least(_page,100000))*25) p),'[]')) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.repository_list(jsonb,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_list(jsonb,integer) TO authenticated;
CREATE TABLE public.lead_repository_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email_id uuid REFERENCES public.lead_repository_emails(id) ON DELETE SET NULL, review jsonb NOT NULL, actor_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_repository_reviews TO authenticated;
GRANT ALL ON public.lead_repository_reviews TO service_role;
ALTER TABLE public.lead_repository_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY repository_admin_read ON public.lead_repository_reviews FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY repository_admin_boundary ON public.lead_repository_reviews AS RESTRICTIVE FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.repository_review_history() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN INSERT INTO public.lead_repository_reviews(email_id,review,actor_id) VALUES(NEW.id,NEW.review,NEW.reviewed_by); END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.repository_review_history() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER repository_review_history AFTER UPDATE ON public.lead_repository_emails FOR EACH ROW EXECUTE FUNCTION public.repository_review_history();
COMMENT ON TABLE public.lead_repository_objections IS 'Independent minimal objection evidence: no cascading lead deletion; retention requires controller/legal review.';
COMMENT ON TABLE public.lead_repository_recipients IS 'Dry-run only. No sender or cron reads this table. HOLD and NULL sent_at cannot be changed to sendable values.';
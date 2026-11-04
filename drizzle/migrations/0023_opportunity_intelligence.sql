CREATE TABLE public.opportunity_import_batches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 filename text NOT NULL, file_hash text NOT NULL UNIQUE,
 row_count int NOT NULL DEFAULT 0, accepted int NOT NULL DEFAULT 0, skipped int NOT NULL DEFAULT 0,
 errors jsonb NOT NULL DEFAULT '[]', created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.opportunities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 kind text NOT NULL CHECK (kind IN ('active_buyer_request','prospect_hypothesis')),
 title text NOT NULL CHECK (length(trim(title)) > 0),
 company text, source_url text NOT NULL CHECK (source_url ~* '^https?://'),
 source_url_norm text NOT NULL UNIQUE,
 source_type text NOT NULL DEFAULT 'unknown', discovery_method text NOT NULL DEFAULT 'manual_import',
 posted_at timestamptz, deadline_at timestamptz, retrieved_at timestamptz,
 country text, service_need text, fit_reason text, public_contact_route text,
 deliverables jsonb NOT NULL DEFAULT '[]', evidence jsonb NOT NULL DEFAULT '[]', risks jsonb NOT NULL DEFAULT '[]',
 score_breakdown jsonb NOT NULL DEFAULT '{}', priority_score int NOT NULL DEFAULT 0 CHECK (priority_score BETWEEN 0 AND 100),
 status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','qualified','proposal_sent','won','lost','archived','rejected')),
 follow_up_at timestamptz, notes text, batch_id uuid REFERENCES public.opportunity_import_batches(id),
 created_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.opportunity_outcomes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 opportunity_id uuid NOT NULL REFERENCES public.opportunities(id),
 outcome text NOT NULL CHECK (outcome IN ('proposal_sent','reply','meeting','won','lost','no_response')),
 value_cents bigint CHECK (value_cents IS NULL OR value_cents >= 0), currency text, note text,
 actor_id uuid DEFAULT auth.uid(), occurred_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.opportunity_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), opportunity_id uuid, action text NOT NULL,
 details jsonb NOT NULL DEFAULT '{}', actor_id uuid, created_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT, INSERT, UPDATE ON public.opportunities TO authenticated;
GRANT SELECT ON public.opportunity_import_batches, public.opportunity_events TO authenticated;
GRANT SELECT, INSERT ON public.opportunity_outcomes TO authenticated;
GRANT ALL ON public.opportunities, public.opportunity_import_batches, public.opportunity_outcomes, public.opportunity_events TO service_role;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin read opportunities" ON public.opportunities FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert opportunities" ON public.opportunities FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update opportunities" ON public.opportunities FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin read batches" ON public.opportunity_import_batches FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin read outcomes" ON public.opportunity_outcomes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert outcomes" ON public.opportunity_outcomes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND actor_id = auth.uid());
CREATE POLICY "admin read events" ON public.opportunity_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.opportunity_log_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  NEW.updated_at := now();
  -- source identity and type are immutable after import
  NEW.source_url := OLD.source_url; NEW.source_url_norm := OLD.source_url_norm; NEW.kind := OLD.kind;
  INSERT INTO opportunity_events(opportunity_id,action,details,actor_id) VALUES(NEW.id,'update',
   jsonb_build_object('changed',(SELECT coalesce(jsonb_agg(n.key),'[]') FROM jsonb_each(to_jsonb(NEW)) n WHERE n.key NOT IN ('updated_at') AND n.value IS DISTINCT FROM to_jsonb(OLD)->n.key)),auth.uid());
 ELSE
  INSERT INTO opportunity_events(opportunity_id,action,details,actor_id) VALUES(NEW.id,'create',jsonb_build_object('batch',NEW.batch_id),auth.uid());
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER opportunities_insert_event AFTER INSERT ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.opportunity_log_event();
CREATE TRIGGER opportunities_update_event BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.opportunity_log_event();

CREATE OR REPLACE FUNCTION public.opportunity_outcome_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN INSERT INTO opportunity_events(opportunity_id,action,details,actor_id) VALUES(NEW.opportunity_id,'outcome',jsonb_build_object('outcome',NEW.outcome,'value_cents',NEW.value_cents),auth.uid()); RETURN NEW; END $$;
CREATE TRIGGER opportunity_outcomes_event AFTER INSERT ON public.opportunity_outcomes FOR EACH ROW EXECUTE FUNCTION public.opportunity_outcome_event();

CREATE OR REPLACE FUNCTION public.opportunity_import(_filename text, _hash text, _rows jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE bid uuid; r jsonb; n int:=0; skipped int:=0; errs jsonb:='[]'; idx int:=0; url text; norm text; k text; st text; contact text; affected int;
BEGIN
 PERFORM public.repository_assert_admin();
 IF jsonb_typeof(_rows)<>'array' OR jsonb_array_length(_rows)>1000 OR length(trim(coalesce(_filename,'')))=0 OR length(coalesce(_hash,''))<16 THEN RAISE EXCEPTION 'Invalid import batch'; END IF;
 IF EXISTS(SELECT 1 FROM opportunity_import_batches WHERE file_hash=_hash) THEN RETURN jsonb_build_object('duplicate_file',true,'accepted',0,'skipped',jsonb_array_length(_rows),'errors','[]'::jsonb); END IF;
 INSERT INTO opportunity_import_batches(filename,file_hash,row_count,created_by) VALUES(left(_filename,200),_hash,jsonb_array_length(_rows),auth.uid()) RETURNING id INTO bid;
 FOR r IN SELECT value FROM jsonb_array_elements(_rows) LOOP
  idx:=idx+1;
  BEGIN
   url:=trim(coalesce(r->>'source_url','')); IF url !~* '^https?://[^[:space:]/]+\.[^[:space:]]+$' THEN RAISE EXCEPTION 'Missing or invalid source_url'; END IF;
   norm:=lower(regexp_replace(regexp_replace(url,'^https?://(www\.)?','','i'),'[/#?]+$',''));
   k:=coalesce(r->>'kind',''); st:=lower(coalesce(r->>'source_type',''));
   IF k NOT IN ('active_buyer_request','prospect_hypothesis') THEN RAISE EXCEPTION 'Invalid kind'; END IF;
   IF k='active_buyer_request' AND st IN ('company_website','directory_listing','social_profile','') THEN RAISE EXCEPTION 'Buyer request needs a request/tender/post source, not a company website or listing'; END IF;
   contact:=lower(trim(coalesce(r->>'public_contact_route','')));
   IF contact ~ '@(gmail|seznam|email|outlook|hotmail|yahoo|icloud|centrum|post|volny|gmx|web)\.' AND coalesce(r->>'contact_published_by_business','false')<>'true' THEN RAISE EXCEPTION 'Personal-looking contact without published-business evidence'; END IF;
   IF length(trim(coalesce(r->>'title','')))=0 THEN RAISE EXCEPTION 'Missing title'; END IF;
   INSERT INTO opportunities(kind,title,company,source_url,source_url_norm,source_type,discovery_method,posted_at,deadline_at,retrieved_at,country,service_need,fit_reason,public_contact_route,deliverables,evidence,risks,score_breakdown,priority_score,batch_id,created_by)
   VALUES(k,left(r->>'title',300),left(r->>'company',200),url,norm,coalesce(nullif(st,''),'unknown'),coalesce(nullif(r->>'discovery_method',''),'manual_import'),
    nullif(r->>'posted_at','')::timestamptz,nullif(r->>'deadline_at','')::timestamptz,coalesce(nullif(r->>'retrieved_at','')::timestamptz,now()),
    left(r->>'country',60),left(r->>'service_need',300),left(r->>'fit_reason',2000),nullif(left(contact,300),''),
    coalesce(r->'deliverables','[]'),coalesce(r->'evidence','[]'),coalesce(r->'risks','[]'),coalesce(r->'score_breakdown','{}'),
    greatest(0,least(100,coalesce((r->>'priority_score')::int,0))),bid,auth.uid())
   ON CONFLICT(source_url_norm) DO NOTHING;
   GET DIAGNOSTICS affected=ROW_COUNT; IF affected=0 THEN skipped:=skipped+1; ELSE n:=n+1; END IF;
  EXCEPTION WHEN OTHERS THEN errs:=errs||jsonb_build_array(jsonb_build_object('row',idx,'reason',SQLERRM)); END;
 END LOOP;
 UPDATE opportunity_import_batches SET accepted=n,skipped=skipped,errors=errs WHERE id=bid;
 INSERT INTO opportunity_events(action,details,actor_id) VALUES('import',jsonb_build_object('batch',bid,'file',_filename,'accepted',n,'skipped',skipped,'errors',jsonb_array_length(errs)),auth.uid());
 RETURN jsonb_build_object('duplicate_file',false,'accepted',n,'skipped',skipped,'errors',errs);
END $$;
REVOKE ALL ON FUNCTION public.opportunity_import(text,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.opportunity_import(text,text,jsonb) TO authenticated;
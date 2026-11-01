CREATE OR REPLACE FUNCTION public.repository_verify_roles() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE role_name text; uid uuid; fake_id uuid; claims text:=current_setting('request.jwt.claims',true); original_sub text:=current_setting('request.jwt.claim.sub',true); report jsonb:='{}'; allowed boolean;
BEGIN
 PERFORM public.repository_assert_admin();
 FOREACH role_name IN ARRAY ARRAY['user','editor','moderator','admin','super_admin'] LOOP
 SELECT ur.user_id INTO uid FROM public.user_roles ur WHERE ur.role::text=role_name AND NOT EXISTS(SELECT 1 FROM public.user_roles more WHERE more.user_id=ur.user_id AND more.role<>ur.role);
 BEGIN
 IF uid IS NULL THEN
 fake_id:=gen_random_uuid();
 INSERT INTO public.user_roles(user_id,role) VALUES(fake_id,role_name::public.app_role);
 uid:=fake_id;
 END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 PERFORM set_config('request.jwt.claim.sub',uid::text,true);
 allowed:=public.has_role(uid,'admin');
 IF allowed IS DISTINCT FROM (role_name IN ('admin','super_admin')) THEN RAISE EXCEPTION 'Role hierarchy failed'; END IF;
 IF allowed THEN PERFORM public.repository_list('{}',0);
 ELSE
 BEGIN PERFORM public.repository_list('{}',0); RAISE EXCEPTION 'Repository role bypass'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 END IF;
 report:=report || jsonb_build_object(role_name,CASE WHEN allowed THEN 'allowed' ELSE 'denied' END);
 RAISE EXCEPTION USING ERRCODE='ZQ002',MESSAGE='Rollback role verification';
 EXCEPTION WHEN foreign_key_violation THEN
 report:=report || jsonb_build_object(role_name,'no_matching_account_static_policy_only');
 WHEN SQLSTATE 'ZQ002' THEN NULL;
 END;
 END LOOP;
 PERFORM set_config('request.jwt.claims',coalesce(claims,''),true);
 PERFORM set_config('request.jwt.claim.sub',coalesce(original_sub,''),true);
 RETURN report;
END $$;
REVOKE ALL ON FUNCTION public.repository_verify_roles() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_verify_roles() TO authenticated;
COMMENT ON FUNCTION public.repository_verify_roles() IS 'Admin diagnostic: uses existing single-role accounts; any attempted synthetic role writes are rolled back and never persist. Does not create auth users.';
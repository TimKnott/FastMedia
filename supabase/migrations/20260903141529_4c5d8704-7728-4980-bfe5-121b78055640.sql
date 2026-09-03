create or replace function public.set_email_queue_service_key(new_key text)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'email_queue_service_role_key';
  if v_id is null then
    perform vault.create_secret(new_key, 'email_queue_service_role_key', 'Service role key used by scheduled jobs');
  else
    perform vault.update_secret(v_id, new_key);
  end if;
end;
$$;

revoke all on function public.set_email_queue_service_key(text) from public, anon, authenticated;
grant execute on function public.set_email_queue_service_key(text) to service_role;
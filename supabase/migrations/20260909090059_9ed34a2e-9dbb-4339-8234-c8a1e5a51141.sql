do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'inbound_emails'
  ) then
    alter publication supabase_realtime add table public.inbound_emails;
  end if;
end $$;
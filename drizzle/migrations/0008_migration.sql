create table public.lead_feedback (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.business_sites(id) on delete cascade,
  kind text not null default 'lead',
  reason text not null,
  title text default '',
  website text default '',
  created_at timestamptz not null default now()
);
alter table public.lead_feedback enable row level security;
create policy "Admins manage lead feedback" on public.lead_feedback for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'super_admin'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'super_admin'));
grant select, insert, update, delete on public.lead_feedback to authenticated;
grant all on public.lead_feedback to service_role;
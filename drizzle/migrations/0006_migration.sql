alter table public.business_sites add column if not exists sheet_url text;
update public.business_sites set name='Cheval et Stable (Horse & Stable Directory)' where id='40210e5e-9dc4-43ec-8f72-8b72fccb4dd8';

create table public.directory_finds (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.business_sites(id) on delete cascade,
  kind text not null check (kind in ('listing','event','content')),
  title text not null,
  category text default '',
  country text default '',
  city text default '',
  date_start text default '',
  date_end text default '',
  website text default '',
  email text default '',
  phone text default '',
  address text default '',
  summary text default '',
  source_url text default '',
  status text not null default 'new',
  exported_at timestamptz,
  query text default '',
  created_at timestamptz not null default now(),
  unique (site_id, kind, title)
);
alter table public.directory_finds enable row level security;
create policy "Admins manage directory finds" on public.directory_finds
  for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'super_admin'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'super_admin'));
grant select, insert, update, delete on public.directory_finds to authenticated;
grant all on public.directory_finds to service_role;
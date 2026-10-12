create table public.business_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  description text not null default '',
  lead_brief text not null default '',
  default_location text not null default '',
  default_radius_km int not null default 30,
  created_at timestamptz not null default now()
);
create table public.scraped_leads (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.business_sites(id) on delete cascade,
  name text not null,
  category text, website text, email text, phone text, address text,
  distance_note text, why_fit text, source_url text, query text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create index on public.scraped_leads(site_id, created_at desc);
alter table public.business_sites enable row level security;
alter table public.scraped_leads enable row level security;
grant select, insert, update, delete on public.business_sites, public.scraped_leads to authenticated;
grant all on public.business_sites, public.scraped_leads to service_role;
create policy "admins manage sites" on public.business_sites for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins manage scraped leads" on public.scraped_leads for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.business_sites (name,url,description,lead_brief,default_location,default_radius_km) values
('FastMedia.Pro','https://www.fastmedia.pro','Website design studio for Czech tradespeople and small businesses.','Find small Czech businesses and tradespeople (plumbers, electricians, salons, workshops, restaurants etc.) that have no website, an outdated website, or only a Facebook/Firmy.cz profile. They are prospects for a new website.','Česká republika',50),
('Zelený Kůň','','Hydroponic fresh barley fodder for animals.','Find farms, stables, breeders and smallholders keeping animals that eat barley fodder: horses, cattle/cows, dairy farms, goats, sheep, alpacas, rabbits, pigs, poultry. Prefer those within the radius of the location. They are buyers of fresh green fodder.','Telč, Česká republika',30),
('Horse & Stable Directory','','Directory listing stables, horse services and equestrian businesses.','Find businesses in the requested equestrian industry (stables, riding schools, farriers, equine vets, saddlers, horse transport, feed suppliers etc.) that could be added as directory listings.','Česká republika',100);
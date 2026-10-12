alter table public.business_sites add column if not exists modes jsonb not null default '[]'::jsonb;
update public.business_sites set modes='["bad_site"]' where id='a89cbd30-2400-4bb4-9e20-9786954d05dc';
update public.business_sites set modes='["local_place","audience_pack"]', default_location='Louny a Ústí nad Labem', default_radius_km=40 where id='bb038053-04ce-4d9f-a5dc-44a06ac3172a';
update public.business_sites set modes='["listing","event","content"]' where id='40210e5e-9dc4-43ec-8f72-8b72fccb4dd8';
alter table public.directory_finds drop constraint if exists directory_finds_kind_check;
alter table public.directory_finds add constraint directory_finds_kind_check check (kind in ('listing','event','content','bad_site','local_place','audience_pack'));
alter table public.directory_finds add column if not exists score int, add column if not exists audit jsonb;
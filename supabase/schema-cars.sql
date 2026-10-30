-- Catálogo de autos / resultados. Pegar en SQL Editor. Se puede repetir.

create table if not exists public.car_jobs (
  id text primary key,
  title text not null default '',
  car text not null default '',
  year text not null default '',
  blurb text not null default '',
  mods text[] not null default '{}',
  cover text not null default '',
  photos text[] not null default '{}',
  videos text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.car_jobs enable row level security;

drop policy if exists "public read cars" on public.car_jobs;
drop policy if exists "admin write cars" on public.car_jobs;

create policy "public read cars"
  on public.car_jobs for select to anon, authenticated
  using (published or public.is_admin());

create policy "admin write cars"
  on public.car_jobs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.car_jobs to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'car-results',
  'car-results',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/x-matroska', 'application/octet-stream', 'application/json', 'text/plain']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read car media" on storage.objects;
drop policy if exists "admin upload car media" on storage.objects;

create policy "public read car media"
  on storage.objects for select to public
  using (bucket_id = 'car-results');

create policy "admin upload car media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'car-results');

do $$
begin
  alter publication supabase_realtime add table public.car_jobs;
exception when duplicate_object then null;
end $$;

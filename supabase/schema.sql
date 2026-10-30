-- Pegar entero en SQL Editor de Supabase. Se puede repetir.
-- No uses la service_role key en el frontend.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  available boolean not null default true,
  published boolean not null default true,
  features text[] not null default '{}',
  images text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_settings (
  id integer primary key check (id = 1),
  whatsapp text not null default ''
);

create table if not exists public.catalog_items (
  id text primary key,
  sku text not null unique,
  name text not null default '',
  category text not null default 'Otros',
  blurb text not null default '',
  specs text[] not null default '{}',
  price numeric(12,2) not null default 0 check (price >= 0),
  photo text not null default '',
  images text[] not null default '{}',
  published boolean not null default true,
  available boolean not null default true,
  hotspot text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.products (sku, name, category, description, price, available, published, features, images)
values (
  'LCDA-ALE-001',
  'Alerón Deportivo GT para Toyota Corolla',
  'Alerones y spoilers',
  'Alerón elevado de línea GT para el maletero del Corolla. Cambia la silueta trasera y se cotiza según año, versión e instalación en taller.',
  450,
  true,
  true,
  array[
    'Tipo: alerón deportivo elevado',
    'Acabado demo: blanco con labio negro',
    'Ubicación: maletero posterior',
    'Compatibilidad: se confirma por año y versión',
    'Instalación: montaje en taller, no es un clip-on'
  ],
  array['/photos/sedan-spoiler.jpg', '/photos/sedan-rear.jpg', '/photos/sedan-orbit.jpg']
)
on conflict (sku) do nothing;

update public.products
set images = array['/photos/sedan-spoiler.jpg', '/photos/sedan-rear.jpg', '/photos/sedan-orbit.jpg']
where sku = 'LCDA-ALE-001' and cardinality(images) = 0;

insert into public.shop_settings (id, whatsapp) values (1, '51962673733')
on conflict (id) do update set whatsapp = excluded.whatsapp;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.shop_settings enable row level security;
alter table public.catalog_items enable row level security;

drop policy if exists "public read product" on public.products;
drop policy if exists "admin update product" on public.products;
drop policy if exists "public read settings" on public.shop_settings;
drop policy if exists "admin update settings" on public.shop_settings;
drop policy if exists "public read catalog" on public.catalog_items;
drop policy if exists "admin write catalog" on public.catalog_items;

create policy "public read product"
  on public.products for select to anon, authenticated
  using (published or public.is_admin());

create policy "admin update product"
  on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read settings"
  on public.shop_settings for select to anon, authenticated
  using (true);

create policy "admin update settings"
  on public.shop_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public read catalog"
  on public.catalog_items for select to anon, authenticated
  using (published or public.is_admin());

create policy "admin write catalog"
  on public.catalog_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.catalog_items to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.shop_settings to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "admin upload photos" on storage.objects;
drop policy if exists "public read photos" on storage.objects;

create policy "public read photos"
  on storage.objects for select to public
  using (bucket_id = 'product-images');

create policy "admin upload photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

do $$
begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.shop_settings;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.catalog_items;
exception when duplicate_object then null;
end $$;

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

-- Run in Supabase SQL editor. Never expose service_role key in the browser.
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), sku text not null unique,
 name text not null, category text not null, description text not null,
 price numeric(12,2) not null check (price >= 0), available boolean not null default true,
 published boolean not null default true, features text[] not null default '{}',
 images text[] not null default '{}', updated_at timestamptz not null default now()
);
create table if not exists public.shop_settings (id integer primary key check(id=1), whatsapp text not null default '');
insert into public.products(sku,name,category,description,price,available,published,features,images)
values ('LCDA-ALE-001','Alerón Deportivo GT para Toyota Corolla','Alerones y spoilers','Alerón deportivo de diseño aerodinámico que realza la apariencia exterior del Toyota Corolla, aportando un estilo moderno y deportivo.',450,true,true,array['Tipo: Alerón deportivo elevado','Color: Blanco con detalles negros','Ubicación: Maletero posterior','Compatibilidad: Por confirmar según año y versión','Instalación: Requiere verificación y montaje especializado'],array[]::text[])
on conflict(sku) do nothing;
insert into public.shop_settings(id,whatsapp) values(1,'') on conflict(id) do nothing;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$select exists(select 1 from public.admin_users where user_id = (select auth.uid()))$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.shop_settings enable row level security;
create policy "public read product" on public.products for select to anon,authenticated using (published or public.is_admin());
create policy "admin update product" on public.products for update to authenticated using (public.is_admin()) with check(public.is_admin());
create policy "public read settings" on public.shop_settings for select to anon,authenticated using(true);
create policy "admin update settings" on public.shop_settings for update to authenticated using(public.is_admin()) with check(public.is_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "admin upload photos" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_admin());
-- After creating a user via Supabase Auth dashboard, grant admin explicitly:
-- insert into public.admin_users(user_id) values ('USER_UUID_FROM_AUTH_DASHBOARD');
-- To enable live updates: Supabase Dashboard > Database > Publications > supabase_realtime > add products and shop_settings.

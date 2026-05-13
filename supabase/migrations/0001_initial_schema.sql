-- Create the table for storing inquiries (if not exists)
create table if not exists public.inquiries (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  contact text not null,
  occasion text not null,
  art_forms text[] null,
  budget text not null,
  description text null,
  address text not null,
  needed_by date null,
  file_name text null,
  status text not null default 'new'::text,
  confirmed_price text null,
  final_delivery_date date null,
  final_notes text null,
  payment_status text null default 'pending'::text,
  shipping_info text null,
  constraint inquiries_pkey primary key (id)
);

-- Create table for simple admin authentication
create table if not exists public.admins (
    id uuid not null default gen_random_uuid(),
    email text not null unique,
    password text not null
);

-- Creator / seller collaboration applications.
-- This supports creators who want Rifa to sell their existing products,
-- or creators who want a dedicated merchandise dashboard/catalogue.
create table if not exists public.creator_applications (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  creator_name text not null,
  brand_name text null,
  contact text not null,
  email text null,
  location text null,
  collaboration_type text not null,
  product_categories text[] null,
  price_range text null,
  product_description text not null,
  social_link text null,
  image_url text null,
  mobile_number text null,
  shop_name text null,
  shop_slug text null,
  primary_craft_category text null,
  home_region text null,
  craft_origin_story text null,
  shop_banner_url text null,
  shop_logo_url text null,
  shipping_origin_pin_code text null,
  status text not null default 'new'::text,
  dashboard_status text not null default 'not-started'::text,
  commission_terms text null,
  admin_notes text null,
  constraint creator_applications_pkey primary key (id)
);

-- Add v3.1 seller storefront fields to existing creator application tables.
alter table public.creator_applications add column if not exists mobile_number text null;
alter table public.creator_applications add column if not exists shop_name text null;
alter table public.creator_applications add column if not exists shop_slug text null;
alter table public.creator_applications add column if not exists primary_craft_category text null;
alter table public.creator_applications add column if not exists home_region text null;
alter table public.creator_applications add column if not exists craft_origin_story text null;
alter table public.creator_applications add column if not exists shop_banner_url text null;
alter table public.creator_applications add column if not exists shop_logo_url text null;
alter table public.creator_applications add column if not exists shipping_origin_pin_code text null;

-- Disable RLS for now to keep it "simple" as requested, 
-- or enable it with broad permissions if user wants to play with policies later.
-- For "simple table" requests, often RLS gets in the way of "it just works".
-- Let's enable it but allow all access for now to ensure their frontend queries works without auth header hassle
alter table public.inquiries enable row level security;
alter table public.admins enable row level security;
alter table public.creator_applications enable row level security;

-- Policy: Allow all access to inquiries for now (Simplest "works like localstorage" mode)
create policy "Allow all access to inquiries" on public.inquiries for all using (true);

-- Policy: Allow all access to creator applications for the simple frontend admin mode.
create policy "Allow all access to creator applications" on public.creator_applications for all using (true);

-- Storage bucket for sample product photos uploaded by creator applicants.
insert into storage.buckets (id, name, public)
values ('creator-product-images', 'creator-product-images', true)
on conflict (id) do nothing;

create policy "Allow public read access to creator product images"
on storage.objects for select
using (bucket_id = 'creator-product-images');

create policy "Allow public uploads to creator product images"
on storage.objects for insert
with check (bucket_id = 'creator-product-images');

-- Policy: Allow read access to admins for login check
create policy "Allow public read access to admins" on public.admins for select using (true);
create policy "Allow full access to admins" on public.admins for all using (true);

-- Insert default admin user
insert into public.admins (email, password)
values ('admin@rifa.com', 'admin123')
on conflict (email) do nothing;

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

-- Disable RLS for now to keep it "simple" as requested, 
-- or enable it with broad permissions if user wants to play with policies later.
-- For "simple table" requests, often RLS gets in the way of "it just works".
-- Let's enable it but allow all access for now to ensure their frontend queries works without auth header hassle
alter table public.inquiries enable row level security;
alter table public.admins enable row level security;

-- Policy: Allow all access to inquiries for now (Simplest "works like localstorage" mode)
create policy "Allow all access to inquiries" on public.inquiries for all using (true);

-- Policy: Allow read access to admins for login check
create policy "Allow public read access to admins" on public.admins for select using (true);
create policy "Allow full access to admins" on public.admins for all using (true);

-- Insert default admin user
insert into public.admins (email, password)
values ('admin@rifa.com', 'admin123')
on conflict (email) do nothing;

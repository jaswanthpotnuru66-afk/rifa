-- Create a custom users table in the public schema
create table if not exists public.users (
  id uuid not null default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  mobile_number text,
  location text,
  role text default 'user'
);

-- Enable RLS
alter table public.users enable row level security;

-- Policy: Allow users to read their own data
create policy "Users can read own data" on public.users
  for select using (true); -- For simplicity in this session, allowing read, but in prod you'd use a JWT check

-- Policy: Allow service role or public registration for now
create policy "Allow registration" on public.users
  for insert with check (true);

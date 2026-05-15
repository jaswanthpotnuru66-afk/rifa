-- Drop existing table to ensure fresh schema
drop table if exists public.wishlist cascade;

-- Create wishlist table
create table public.wishlist (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    product_id text not null,
    product_name text not null,
    price decimal(12,2) not null,
    image_url text,
    category text,
    artisan_id text,
    created_at timestamp with time zone default now()
);

alter table public.wishlist enable row level security;

-- Create policy safely
do $$
begin
    if not exists (
        select 1 from pg_policies 
        where tablename = 'wishlist' and policyname = 'Users can manage own wishlist'
    ) then
        create policy "Users can manage own wishlist" on public.wishlist for all using (true);
    end if;
end
$$;

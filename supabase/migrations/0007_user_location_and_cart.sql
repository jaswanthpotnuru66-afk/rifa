-- Add location to users and create cart table
alter table public.users add column if not exists location text;

create table if not exists public.cart_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    product_id text not null,
    product_name text not null,
    price decimal(12,2) not null,
    quantity integer not null default 1,
    image_url text,
    created_at timestamp with time zone default now()
);

alter table public.cart_items enable row level security;
create policy "Users can manage own cart" on public.cart_items for all using (true);

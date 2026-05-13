-- Dynamic Data Tables for User Profile

-- 1. Orders
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    status text not null default 'processing', -- processing, shipped, delivered, cancelled
    total_amount decimal(12,2) not null,
    shipping_address text,
    payment_method text,
    tracking_number text
);

-- 2. Order Items
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade,
    product_id text not null, -- references external product logic for now
    product_name text not null,
    price decimal(12,2) not null,
    quantity integer not null default 1,
    image_url text
);

-- 3. Addresses
create table if not exists public.user_addresses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    label text not null, -- Home, Office, etc.
    full_name text not null,
    phone text not null,
    address_line1 text not null,
    address_line2 text,
    city text not null,
    state text not null,
    pincode text not null,
    is_default boolean default false
);

-- 4. Wishlist
create table if not exists public.wishlist (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    product_id text not null,
    created_at timestamp with time zone default now(),
    unique(user_id, product_id)
);

-- Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_addresses enable row level security;
alter table public.wishlist enable row level security;

-- Policies (Allow all for simplicity in this dev phase, or filter by user_id)
create policy "Users can manage own orders" on public.orders for all using (true);
create policy "Users can manage own order items" on public.order_items for all using (true);
create policy "Users can manage own addresses" on public.user_addresses for all using (true);
create policy "Users can manage own wishlist" on public.wishlist for all using (true);

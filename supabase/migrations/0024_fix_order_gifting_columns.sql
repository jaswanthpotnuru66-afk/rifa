-- Ensure all required columns exist in orders table for successful checkout
alter table public.orders add column if not exists total_amount numeric;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists shipping_address jsonb;
alter table public.orders add column if not exists is_gifting boolean default false;
alter table public.orders add column if not exists gift_message text;
alter table public.orders add column if not exists payment_status text default 'pending';
alter table public.orders add column if not exists artisan_id text;

-- Also ensure order_items is up to date
alter table public.order_items add column if not exists artisan_id text;

-- Refresh schema cache
notify pgrst, 'reload schema';

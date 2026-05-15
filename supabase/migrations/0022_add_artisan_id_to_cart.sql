-- Add artisan_id to cart_items table
alter table public.cart_items add column if not exists artisan_id text;

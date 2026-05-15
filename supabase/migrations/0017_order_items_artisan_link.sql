-- Add artisan_id to order_items for direct lookup
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS artisan_id TEXT;

-- Update existing order_items if possible (optional but good)
-- This assumes order_items.product_id matches products.id
UPDATE public.order_items oi
SET artisan_id = p.artisan_id
FROM public.products p
WHERE oi.product_id = p.id AND oi.artisan_id IS NULL;

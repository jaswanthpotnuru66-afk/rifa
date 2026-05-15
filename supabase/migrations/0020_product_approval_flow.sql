-- Add status column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add product_count to artisans
ALTER TABLE artisans ADD COLUMN IF NOT EXISTS product_count integer DEFAULT 0;

-- Create an index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

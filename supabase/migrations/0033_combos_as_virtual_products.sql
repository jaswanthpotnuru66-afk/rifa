-- Migration 0033: Combos as Virtual Products

-- 1. Extend the products table to support Virtual Products (Combos)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS combo_items TEXT[] DEFAULT '{}';

-- 2. Clean up the deprecated Combos table to avoid confusion (from 0031)
-- We will just rename it so we don't destroy data, but remove it from the active schema concept.
ALTER TABLE IF EXISTS public.combos RENAME TO deprecated_combos;

-- 3. Create a Postgres Trigger for the Auto-Destruct Rule
-- If any real product goes out of stock (is_ready = false) or is deleted, 
-- any virtual product (combo) containing it must auto-unpublish (is_ready = false).

-- Function to check if a product update affects parent combos
CREATE OR REPLACE FUNCTION check_combo_auto_destruct()
RETURNS TRIGGER AS $$
BEGIN
    -- If the product is no longer ready (out of stock)
    IF NEW.is_ready = FALSE AND OLD.is_ready = TRUE THEN
        -- Find all combos that include this product ID and unpublish them
        UPDATE public.products 
        SET is_ready = FALSE, status = 'draft'
        WHERE is_combo = TRUE 
        AND NEW.id = ANY(combo_items);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for product updates
DROP TRIGGER IF EXISTS trigger_auto_destruct_combo ON public.products;
CREATE TRIGGER trigger_auto_destruct_combo
AFTER UPDATE ON public.products
FOR EACH ROW
WHEN (OLD.is_ready IS DISTINCT FROM NEW.is_ready)
EXECUTE FUNCTION check_combo_auto_destruct();

-- Function to handle product deletion
CREATE OR REPLACE FUNCTION check_combo_auto_destruct_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Unpublish combos that contained the deleted product
    UPDATE public.products 
    SET is_ready = FALSE, status = 'draft'
    WHERE is_combo = TRUE 
    AND OLD.id = ANY(combo_items);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for product deletions
DROP TRIGGER IF EXISTS trigger_auto_destruct_combo_delete ON public.products;
CREATE TRIGGER trigger_auto_destruct_combo_delete
AFTER DELETE ON public.products
FOR EACH ROW
EXECUTE FUNCTION check_combo_auto_destruct_delete();

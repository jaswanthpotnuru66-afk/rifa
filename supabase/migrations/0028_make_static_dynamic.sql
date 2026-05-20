-- 1. Create Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id SERIAL PRIMARY KEY,
    commission NUMERIC(5,2) DEFAULT 5.00,
    payout_frequency TEXT DEFAULT 'Bi-weekly',
    weight_threshold NUMERIC(5,2) DEFAULT 10.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Settings
INSERT INTO public.platform_settings (id, commission, payout_frequency, weight_threshold)
VALUES (1, 5.00, 'Bi-weekly', 10.00)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Flagged Listings Table
CREATE TABLE IF NOT EXISTS public.flagged_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    artisan_id TEXT REFERENCES public.artisans(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Offers & Combos Table
CREATE TABLE IF NOT EXISTS public.offers_combos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    price TEXT NOT NULL,
    tag TEXT NOT NULL,
    img_idx INTEGER NOT NULL,
    dark BOOLEAN DEFAULT FALSE,
    includes TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Curated Hampers / Combos
INSERT INTO public.offers_combos (tier, title, subtitle, price, tag, img_idx, dark, includes)
VALUES 
('01', 'Student Friendly', 'The Thoughtful Starter', '₹500', 'Great for Students', 2, false, ARRAY['Handcrafted Keychain', 'Mini Resin Frame', 'Complimentary gift wrap', 'Personalised note card']),
('02', 'Standard Love', 'The Signature Set', '₹1,000', 'Most Popular', 10, true, ARRAY['Handcrafted Bouquet', 'Resin Photo Frame', 'Premium Chocolate', 'Complimentary gift wrap', 'Personalised note card']),
('03', 'Premium Hamper', 'The Statement Gift', '₹1,500+', 'Best Value', 18, false, ARRAY['Large Handcrafted Bouquet', 'Custom Resin Clock', 'Curated Gift Box', 'Surprise Add-ons', 'Complimentary gift wrap', 'Personalised note card'])
ON CONFLICT DO NOTHING;

-- 4. Extend existing public.promotions to support artisan promotions
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS artisan_id TEXT REFERENCES public.artisans(id) ON DELETE CASCADE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS value NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');

-- 5. Extend public.product_reviews to support replies from artisans
ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS maker_reply TEXT;

-- Seed Sample Reviews for weavers-of-bengal
INSERT INTO public.product_reviews (product_id, user_name, rating, comment, verified, created_at, maker_reply)
VALUES
('heritage-jamdani-saree', 'Ruchika Sen', 5, 'Absolutely stunning craftsmanship. The texture and motifs are even better in person.', true, NOW() - INTERVAL '4 days', 'Thank you so much! We are glad you liked the traditional hand-weaving.'),
('heritage-jamdani-saree', 'Pooja Roy', 5, 'Beautiful piece of art. It arrived very well packaged.', true, NOW() - INTERVAL '8 days', NULL)
ON CONFLICT DO NOTHING;

-- Seed Sample Reviews for rajesh-woodworks
INSERT INTO public.product_reviews (product_id, user_name, rating, comment, verified, created_at, maker_reply)
VALUES
('resin-ocean-frame', 'Vivek Patil', 4, 'Good quality wood. The inlay is premium.', true, NOW() - INTERVAL '12 days', 'Happy to serve you! We source local teakwood for that specific finish.')
ON CONFLICT DO NOTHING;

-- Seed sample flagged listings
INSERT INTO public.flagged_listings (product_id, artisan_id, reason, status)
VALUES
('resin-ocean-frame', 'rajesh-woodworks', 'Community report: misleading description regarding brass content.', 'active')
ON CONFLICT DO NOTHING;

-- Seed sample promotions for weavers-of-bengal
INSERT INTO public.promotions (title, description, type, code, is_active, artisan_id, value)
VALUES
('Festive Weaves', 'Get 10% off on premium Bengal sarees.', 'discount', 'WESTBENGAL10', true, 'weavers-of-bengal', 10.00)
ON CONFLICT DO NOTHING;

-- Seed sample promotions for jaipur-collective
INSERT INTO public.promotions (title, description, type, code, is_active, artisan_id, value)
VALUES
('Summer Clay Special', 'Get ₹250 flat discount on pottery.', 'discount', 'JAIPUR250', true, 'jaipur-collective', 250.00)
ON CONFLICT DO NOTHING;

-- Seed sample disputes linked to orders
-- Since order_id is FK to orders, let's look up an order or insert a fake order first
-- Let's check orders table to see if any exist, or insert sample orders first
-- Insert a sample order for weavers-of-bengal
INSERT INTO public.orders (id, total_amount, status, payment_method, payment_status, shipping_address)
VALUES
('d9b01234-5678-1234-5678-1234567890ab', 8500.00, 'delivered', 'cod', 'completed', '{"full_name": "Ruchika Sen", "city": "Mumbai", "phone": "9876543210"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.orders (id, total_amount, status, payment_method, payment_status, shipping_address)
VALUES
('a1b02345-6789-2345-6789-2345678901bc', 1200.00, 'shipped', 'online', 'completed', '{"full_name": "Harsha", "city": "Gurgaon", "phone": "9898989898"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.order_items (order_id, product_id, product_name, price, quantity, artisan_id)
VALUES
('d9b01234-5678-1234-5678-1234567890ab', 'heritage-jamdani-saree', 'Heritage Hand-woven Jamdani', 8500.00, 1, 'weavers-of-bengal'),
('a1b02345-6789-2345-6789-2345678901bc', 'resin-ocean-frame', 'Oceanic Resin Photo Frame', 1200.00, 1, 'rajesh-woodworks')
ON CONFLICT DO NOTHING;

-- Seed disputes table
INSERT INTO public.disputes (order_id, artisan_id, category, description, status, verdict, admin_notes)
VALUES
('a1b02345-6789-2345-6789-2345678901bc', 'rajesh-woodworks', 'mismatch', 'The brass wire inlay has sharp corners that feel unsafe.', 'open', NULL, NULL),
('d9b01234-5678-1234-5678-1234567890ab', 'weavers-of-bengal', 'damaged', 'A minor tear was found on the edge border.', 'resolved', 'refunded', 'Evidence confirmed shipping damage. Refund issued to buyer.')
ON CONFLICT DO NOTHING;

-- Seed payouts table
INSERT INTO public.payouts (artisan_id, order_ids, gross_amount, commission_amount, tcs_amount, shipping_adjustment, net_amount, status, released_at)
VALUES
('weavers-of-bengal', ARRAY['d9b01234-5678-1234-5678-1234567890ab'::UUID], 8500.00, 425.00, 85.00, 0.00, 7990.00, 'released', NOW() - INTERVAL '3 days'),
('rajesh-woodworks', ARRAY['a1b02345-6789-2345-6789-2345678901bc'::UUID], 1200.00, 60.00, 12.00, -135.00, 993.00, 'held', NULL)
ON CONFLICT DO NOTHING;

-- Seed shipping_alerts table
INSERT INTO public.shipping_alerts (order_id, artisan_id, type, severity, description, original_weight, detected_weight, adjustment_amount, status, resolved_at)
VALUES
('a1b02345-6789-2345-6789-2345678901bc', 'rajesh-woodworks', 'weight_mismatch', 'medium', 'Parcel declared at 800g, but scanned at 1050g.', 800.00, 1050.00, -135.00, 'pending', NULL)
ON CONFLICT DO NOTHING;

-- RLS Enable & General Policies
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers_combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Platform Settings" ON public.platform_settings FOR ALL USING (true);
CREATE POLICY "Public Flagged Listings" ON public.flagged_listings FOR ALL USING (true);
CREATE POLICY "Public Offers Combos" ON public.offers_combos FOR ALL USING (true);

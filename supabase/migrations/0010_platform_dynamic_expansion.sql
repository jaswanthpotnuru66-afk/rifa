-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    img TEXT, -- Category thumbnail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Promotions (Bank Offers & Site-wide Discounts)
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- 'bank_offer', 'discount', 'free_shipping'
    code TEXT,
    bank_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Gifting Concierge Configuration (Dynamic Questions)
CREATE TABLE IF NOT EXISTS public.concierge_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    question TEXT NOT NULL,
    subtext TEXT,
    options JSONB, -- Array of {label, value, icon, description}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Gallery Items (Home Page Inspiration)
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    img TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    category TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concierge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Public Access
CREATE POLICY "Public Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Public Concierge" ON public.concierge_questions FOR SELECT USING (true);
CREATE POLICY "Public Gallery" ON public.gallery_items FOR SELECT USING (true);

-- Seed Initial Data for Categories
INSERT INTO public.categories (id, name, description, img) VALUES
('textiles', 'Textiles', 'Woven stories from heritage looms', '/categories/textiles.jpg'),
('pottery', 'Pottery', 'Clay artifacts fired in traditional kilns', '/categories/pottery.jpg'),
('jewelry', 'Jewelry', 'Artisan metalwork and gemstone settings', '/categories/jewelry.jpg'),
('woodwork', 'Woodwork', 'Hand-carved sustainable timber creations', '/categories/woodwork.jpg')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Promotions
INSERT INTO public.promotions (title, description, type, bank_name) VALUES
('HDFC Instant Discount', '10% Instant Discount on HDFC Credit Cards', 'bank_offer', 'HDFC Bank'),
('ICICI Signature Offer', 'Free Artisan Gift Box on ICICI Card orders above ₹10,000', 'bank_offer', 'ICICI Bank'),
('Heritage Welcome', '₹500 off on your first acquisition with code RIFA500', 'discount', NULL)
ON CONFLICT DO NOTHING;

-- Add technique and story columns to gallery_items if they do not exist
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS technique TEXT;
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS story TEXT;

-- Clear old records
DELETE FROM public.categories;
DELETE FROM public.gallery_items;

-- Seed correct Rifa Categories with correct public image assets
INSERT INTO public.categories (id, name, description, img) VALUES
('Resin Art', 'Resin Art', 'Hand-poured floral blocks and custom preservation sheets', '/art_forms/resin_art.png'),
('Crochet', 'Crochet', 'Victorian lace-work and bespoke custom plushies', '/art_forms/crochet.png'),
('Satin Flowers', 'Satin Flowers', 'Singed edge flame-treated premium floral decor', '/art_forms/satin_flowers.png'),
('Clay Art', 'Clay Art', 'Wheel-thrown terracotta and terracotta home ornaments', '/art_forms/clay_art.png'),
('Canvas Art', 'Canvas Art', 'Acrylic paint and local mud impasto artwork', '/art_forms/canvas_art.png'),
('Pipe Cleaners', 'Pipe Cleaners', 'Handcrafted bespoke pipe cleaner bouquets', '/art_forms/pipe_cleaners.png'),
('Hampers', 'Hampers', 'Curated custom combo boxes for special gifting', '/art_forms/hampers.png'),
('Bouquets', 'Bouquets', 'Meticulously tied premium mixed flower bouquets', '/art_forms/bouquets.png')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    img = EXCLUDED.img;

-- Seed correct Rifa Gallery Items with correct public image assets and narratives
INSERT INTO public.gallery_items (img, title, subtitle, category, technique, story, is_featured) VALUES
('/gallery/img1.png', 'The Resin Bloom', 'Hand-poured Epoxy', 'Resin Art', 'Hand-poured Epoxy', 'Capturing the ephemeral beauty of dried spring botanicals in eternal glass-like suspension.', true),
('/gallery/img2.png', 'Midnight Crochet', 'Victorian Lace-work', 'Crochet', 'Victorian Lace-work', 'Intricate micro-patterns inspired by vintage lace, reimagined for modern luxury home decor.', true),
('/gallery/img3.png', 'Earthen Terracotta', 'Wheel-thrown Clay', 'Clay Art', 'Wheel-thrown & Fired', 'Bringing the ancient Indus Valley terracotta heritage to contemporary home table pieces.', true),
('/gallery/img4.png', 'Satin Elegance', 'Singed Edge Petals', 'Satin Flowers', 'Singed Edge Petals', 'Meticulously crafted satin ribbons shaped by flame to mirror organic petals.', true),
('/gallery/img5.png', 'Canvas Whispers', 'Heavy Impasto', 'Canvas Art', 'Heavy Impasto Acrylic', 'Textured strokes of raw local mud and acrylic, capturing monsoon over rural landscapes.', true);

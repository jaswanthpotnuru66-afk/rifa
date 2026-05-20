import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
    console.log('Seeding Categories...');
    
    // Clear old categories
    const { error: delCatErr } = await supabase.from('categories').delete().neq('id', '');
    if (delCatErr) console.error('Error clearing categories:', delCatErr.message);

    const categories = [
        { id: 'Resin Art', name: 'Resin Art', description: 'Hand-poured floral blocks and custom preservation sheets', img: '/art_forms/resin_art.png' },
        { id: 'Crochet', name: 'Crochet', description: 'Victorian lace-work and bespoke custom plushies', img: '/art_forms/crochet.png' },
        { id: 'Satin Flowers', name: 'Satin Flowers', description: 'Singed edge flame-treated premium floral decor', img: '/art_forms/satin_flowers.png' },
        { id: 'Clay Art', name: 'Clay Art', description: 'Wheel-thrown terracotta and terracotta home ornaments', img: '/art_forms/clay_art.png' },
        { id: 'Canvas Art', name: 'Canvas Art', description: 'Acrylic paint and local mud impasto artwork', img: '/art_forms/canvas_art.png' },
        { id: 'Pipe Cleaners', name: 'Pipe Cleaners', description: 'Handcrafted bespoke pipe cleaner bouquets', img: '/art_forms/pipe_cleaners.png' },
        { id: 'Hampers', name: 'Hampers', description: 'Curated custom combo boxes for special gifting', img: '/art_forms/hampers.png' },
        { id: 'Bouquets', name: 'Bouquets', description: 'Meticulously tied premium mixed flower bouquets', img: '/art_forms/bouquets.png' }
    ];

    for (const cat of categories) {
        const { error } = await supabase.from('categories').upsert(cat);
        if (error) console.error(`Error seeding category ${cat.id}:`, error.message);
    }

    console.log('Seeding Gallery Items...');
    
    // Clear old gallery items
    const { error: delGalErr } = await supabase.from('gallery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delGalErr) console.error('Error clearing gallery items:', delGalErr.message);

    const galleryItems = [
        { img: '/gallery/img1.png', title: 'The Resin Bloom', subtitle: 'Hand-poured Epoxy', category: 'Resin Art', technique: 'Hand-poured Epoxy', story: 'Capturing the ephemeral beauty of dried spring botanicals in eternal glass-like suspension.', is_featured: true },
        { img: '/gallery/img2.png', title: 'Midnight Crochet', subtitle: 'Victorian Lace-work', category: 'Crochet', technique: 'Victorian Lace-work', story: 'Intricate micro-patterns inspired by vintage lace, reimagined for modern luxury home decor.', is_featured: true },
        { img: '/gallery/img3.png', title: 'Earthen Terracotta', subtitle: 'Wheel-thrown Clay', category: 'Clay Art', technique: 'Wheel-thrown & Fired', story: 'Bringing the ancient Indus Valley terracotta heritage to contemporary home table pieces.', is_featured: true },
        { img: '/gallery/img4.png', title: 'Satin Elegance', subtitle: 'Singed Edge Petals', category: 'Satin Flowers', technique: 'Singed Edge Petals', story: 'Meticulously crafted satin ribbons shaped by flame to mirror organic petals.', is_featured: true },
        { img: '/gallery/img5.png', title: 'Canvas Whispers', subtitle: 'Heavy Impasto', category: 'Canvas Art', technique: 'Heavy Impasto Acrylic', story: 'Textured strokes of raw local mud and acrylic, capturing monsoon over rural landscapes.', is_featured: true }
    ];

    for (const item of galleryItems) {
        const { error } = await supabase.from('gallery_items').upsert(item);
        if (error) console.error(`Error seeding gallery item ${item.title}:`, error.message);
    }

    console.log('Seeding categories and gallery items complete!');
}

seed();

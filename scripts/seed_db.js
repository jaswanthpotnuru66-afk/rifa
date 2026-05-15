import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { products } from './frontend/src/lib/products.js';
import { artisans } from './frontend/src/lib/artisans.js';

dotenv.config({ path: './backend/.env' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
    console.log('Seeding Artisans...');
    for (const artisan of artisans) {
        const { error } = await supabase.from('artisans').upsert({
            id: artisan.id,
            name: artisan.name,
            location: artisan.location,
            specialty: artisan.specialty,
            product_count: artisan.productCount,
            story: artisan.story,
            technique: artisan.technique,
            heritage: artisan.heritage,
            img: artisan.img,
            process_img: artisan.processImg,
            tags: artisan.tags,
            quote: artisan.quote
        });
        if (error) console.error(`Error seeding artisan ${artisan.id}:`, error.message);
    }

    console.log('Seeding Products...');
    for (const product of products) {
        const { error } = await supabase.from('products').upsert({
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.originalPrice,
            rating: product.rating,
            review_count: product.reviewCount,
            description: product.description,
            details: product.details,
            images: product.images,
            category: product.category,
            tag: product.tag,
            artisan_id: product.artisanId,
            is_custom: product.isCustom || false,
            is_ready: product.isReady || false,
            is_natural: product.isNatural || false
        });
        if (error) console.error(`Error seeding product ${product.id}:`, error.message);
    }

    console.log('Seeding complete!');
}

seed();

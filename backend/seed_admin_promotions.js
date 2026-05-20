import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
    console.log('Seeding Admin Promotions into database...');
    
    const promos = [
        {
            title: 'Platform Welcome Offer',
            description: 'Flat ₹500 discount on any artisan masterpiece.',
            type: 'discount',
            code: 'RIFAADMIN500',
            value: 500.00,
            is_active: true,
            artisan_id: null
        },
        {
            title: 'Global Spring Festival',
            description: 'Get 15% off across all craftmakers.',
            type: 'percentage',
            code: 'RIFAGLOBAL15',
            value: 15.00,
            is_active: true,
            artisan_id: null
        }
    ];

    for (const promo of promos) {
        const { data, error } = await supabase
            .from('promotions')
            .insert([promo])
            .select();
        
        if (error) {
            console.error(`Error seeding ${promo.code}:`, error.message);
        } else {
            console.log(`Successfully seeded ${promo.code}:`, data);
        }
    }
}

seed();

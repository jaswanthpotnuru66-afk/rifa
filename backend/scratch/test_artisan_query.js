import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function run() {
    const userId = 'f07f7c73-45fc-4654-aee0-58926c833423';
    console.log(`Checking database queries for user ID: ${userId}`);

    try {
        console.log('\n--- Query 1: Get artisan details ---');
        const { data: artisan, error: artisanError } = await supabase
            .from('artisans')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        
        if (artisanError) {
            console.error('Artisan query error:', artisanError);
            return;
        }
        console.log('Artisan result:', artisan);

        if (!artisan) {
            console.log('Artisan profile not found.');
            return;
        }

        console.log('\n--- Query 2: Get order items and orders ---');
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('price, quantity, orders(status, created_at)')
            .eq('artisan_id', artisan.id);

        if (itemsError) {
            console.error('Order items query error:', itemsError);
        } else {
            console.log(`Successfully fetched ${items?.length || 0} order items:`, items);
        }

        console.log('\n--- Query 3: Get listings/products ---');
        const { data: listings, error: listingsError } = await supabase
            .from('products')
            .select('status')
            .eq('artisan_id', artisan.id);

        if (listingsError) {
            console.error('Listings query error:', listingsError);
        } else {
            console.log(`Successfully fetched ${listings?.length || 0} listings:`, listings);
        }

    } catch (e) {
        console.error('Unexpected exception during query check:', e);
    }
}

run();

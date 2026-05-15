import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './rifa/backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debug() {
    console.log('--- DB DEBUG ---');
    
    // 1. Get Artisans
    const { data: artisans } = await supabase.from('artisans').select('*');
    console.log('Artisans found:', artisans?.length);
    artisans?.forEach(a => console.log(`- ${a.name} (ID: ${a.id}, User: ${a.user_id})`));

    // 2. Get Products
    const { data: products } = await supabase.from('products').select('id, name, artisan_id').limit(5);
    console.log('\nSample Products:');
    products?.forEach(p => console.log(`- ${p.name} (ID: ${p.id}, Artisan: ${p.artisan_id})`));

    // 3. Get Recent Orders
    const { data: orders } = await supabase.from('orders').select('id, artisan_id, created_at').order('created_at', { ascending: false }).limit(5);
    console.log('\nRecent Orders:');
    orders?.forEach(o => console.log(`- Order: ${o.id}, Artisan: ${o.artisan_id}, Time: ${o.created_at}`));

    // 4. Get Recent Order Items
    const { data: items } = await supabase.from('order_items').select('product_name, artisan_id, order_id').order('created_at', { ascending: false }).limit(5);
    console.log('\nRecent Order Items:');
    items?.forEach(i => console.log(`- Item: ${i.product_name}, Artisan: ${i.artisan_id}, Order: ${i.order_id}`));
}

debug();

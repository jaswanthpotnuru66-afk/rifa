import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function checkProductsTable() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
        console.error('Error fetching product:', error);
    } else if (data && data.length > 0) {
        console.log('Product columns:', Object.keys(data[0]));
        console.log('Sample product data:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('Products table is empty. Unable to inspect columns from data.');
    }
}

checkProductsTable();

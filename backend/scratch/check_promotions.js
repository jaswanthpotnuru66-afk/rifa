import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function checkPromotions() {
    const { data, error } = await supabase.from('promotions').select('*');
    if (error) {
        console.error('Error fetching promotions:', error);
    } else {
        console.log('Promotions in DB:', JSON.stringify(data, null, 2));
    }
}

checkPromotions();

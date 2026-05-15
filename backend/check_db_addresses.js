import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkAddresses() {
    const { data, error } = await supabase.from('user_addresses').select('*');
    if (error) console.error(error);
    else {
        console.log('Addresses in DB:', data.length);
        data.forEach(a => console.log(`- ${a.label} for user ${a.user_id}: ${a.full_name}, ${a.city}`));
    }
}

checkAddresses();

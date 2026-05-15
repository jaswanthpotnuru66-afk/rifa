import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error(error);
    else {
        console.log('Users in DB:', data.length);
        data.forEach(u => {
            console.log(`- ${u.id}: ${u.full_name} (${u.email})`);
            console.log(`  Addresses: ${JSON.stringify(u.addresses)}`);
        });
    }
}

checkUsers();

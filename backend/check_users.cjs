const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
    console.log('--- SYSTEM INTEGRITY AUDIT ---');
    
    // 1. Get Admins
    const { data: admins } = await supabase.from('admins').select('*');
    console.log('\n--- Admins ---');
    admins?.forEach(a => console.log(`- Email: ${a.email}, ID: ${a.id}`));

    // 2. Get Users
    const { data: users } = await supabase.from('users').select('*');
    console.log('\n--- Standard Users ---');
    users?.forEach(u => console.log(`- Email: ${u.email}, ID: ${u.id}, Role: ${u.role}, Full Name: ${u.full_name}, PW Hash: ${u.password_hash}`));

    // 3. Get Artisans
    const { data: artisans } = await supabase.from('artisans').select('*');
    console.log('\n--- Artisans ---');
    artisans?.forEach(art => console.log(`- Name: ${art.name}, ID: ${art.id}, User ID: ${art.user_id}, Status: ${art.status}`));

    // 4. Get Disputes
    const { data: disputes } = await supabase.from('disputes').select('*');
    console.log('\n--- Disputes ---');
    console.log('Disputes found in Supabase:', disputes?.length);
    disputes?.forEach(d => console.log(`- Dispute ID: ${d.id}, Order ID: ${d.order_id}, Status: ${d.status}, Type: ${d.dispute_type}`));
}

check();

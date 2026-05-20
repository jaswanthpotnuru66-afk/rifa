import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function updatePromotions() {
    console.log('Updating promotions table...');
    
    // Update HDFC
    const { data: d1, error: e1 } = await supabase
        .from('promotions')
        .update({ code: 'HDFC10', value: 10, type: 'percentage', description: '10% Instant Discount on HDFC Credit Cards' })
        .eq('title', 'HDFC Instant Discount');
        
    if (e1) console.error('Error updating HDFC:', e1);
    else console.log('Updated HDFC Instant Discount');

    // Update ICICI
    const { data: d2, error: e2 } = await supabase
        .from('promotions')
        .update({ code: 'ICICIART', value: 1000, type: 'discount', description: 'Flat ₹1,000 off on ICICI Card orders above ₹10,000' })
        .eq('title', 'ICICI Signature Offer');
        
    if (e2) console.error('Error updating ICICI:', e2);
    else console.log('Updated ICICI Signature Offer');

    // Update Heritage Welcome
    const { data: d3, error: e3 } = await supabase
        .from('promotions')
        .update({ code: 'RIFA500', value: 500, type: 'discount', description: '₹500 off on your first acquisition with code RIFA500' })
        .eq('title', 'Heritage Welcome');
        
    if (e3) console.error('Error updating Heritage Welcome:', e3);
    else console.log('Updated Heritage Welcome');
}

updatePromotions();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function run() {
  // Try to update woodbeacon to something else to see if it cascades or errors
  const { error } = await supabase.from('artisans').update({ id: 'potnuru-crafts' }).eq('id', 'woodbeacon');
  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('Update succeeded! Cascade is likely enabled or no dependent records.');
    // Revert it back so we don't permanently mess it up during testing
    await supabase.from('artisans').update({ id: 'woodbeacon' }).eq('id', 'potnuru-crafts');
  }
}
run();

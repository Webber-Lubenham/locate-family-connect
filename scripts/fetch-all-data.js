import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAllData() {
  try {
    console.log('Fetching users...');
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    if (usersError) throw usersError;
    console.log('Users:', users);

    console.log('Fetching profiles...');
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
    if (profilesError) throw profilesError;
    console.log('Profiles:', profiles);

    console.log('Fetching locations...');
    const { data: locations, error: locationsError } = await supabase.from('locations').select('*');
    if (locationsError) throw locationsError;
    console.log('Locations:', locations);

    console.log('Fetching guardians...');
    const { data: guardians, error: guardiansError } = await supabase.from('guardians').select('*');
    if (guardiansError) throw guardiansError;
    console.log('Guardians:', guardians);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchAllData();

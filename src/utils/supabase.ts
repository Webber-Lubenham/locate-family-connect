
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

// Use the singleton supabase client from lib/supabase
export default getSupabaseClient();

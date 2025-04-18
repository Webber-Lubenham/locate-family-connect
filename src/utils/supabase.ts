
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

// Use the singleton supabase client to avoid "Multiple GoTrueClient instances" warnings
const supabase = getSupabaseClient();

export default supabase;

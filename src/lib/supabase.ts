import { createClient } from '@supabase/supabase-js';

// For client-side usage (browser)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create an admin client for server-side operations that need elevated permissions
// This should ONLY be used in server-side code, never exposed to the client
export const createAdminClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

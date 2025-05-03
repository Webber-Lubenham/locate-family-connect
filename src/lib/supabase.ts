
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { AUTH_CONFIG } from '@/lib/auth-config';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Get the correct site URL based on the environment
const getSiteUrl = () => {
  if (typeof window === 'undefined') return AUTH_CONFIG.SITE_URL;
  return AUTH_CONFIG.getRedirectUrl();
};

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window?.localStorage
    },
    global: {
      headers: {
        'x-site-url': getSiteUrl()
      }
    }
  }
);

// Export default for backwards compatibility
export default supabase;

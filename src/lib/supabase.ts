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
const supabaseInstance = createClient<Database>(
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

// Export the supabase client directly
export const supabase = supabaseInstance;

// Add a non-enumerable client property that references the same instance
// This avoids the TypeScript recursive type issue while maintaining backwards compatibility
Object.defineProperty(supabase, 'client', {
  value: supabaseInstance,
  writable: false,
  enumerable: false
});

// Export default for backwards compatibility
export default {
  client: supabaseInstance
};

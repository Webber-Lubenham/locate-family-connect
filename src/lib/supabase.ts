
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Import the Supabase client from the integrations folder
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Create a type that extends SupabaseClient to include the client property
type ExtendedSupabaseClient = typeof supabaseClient & {
  client: typeof supabaseClient;
};

// Add the client property to the imported client
(supabaseClient as ExtendedSupabaseClient).client = supabaseClient;

// Export the supabase client directly with the client property
export const supabase = supabaseClient as ExtendedSupabaseClient;

// For backwards compatibility, also export the same client as a property
// This allows both direct usage and .client property access
export default {
  client: supabaseClient
};


import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Import the Supabase client from the integrations folder
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client directly
export const supabase = supabaseClient;

// For backwards compatibility, also export the same client as a property
// This allows both direct usage and .client property access
export default {
  client: supabaseClient
};

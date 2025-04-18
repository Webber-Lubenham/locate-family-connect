import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Environment Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

/**
 * Singleton Supabase Client Manager
 */
// Singleton Supabase Clients
let supabaseClient: SupabaseClient;
let supabaseAdminClient: SupabaseClient;

// Inicializa o cliente padrão
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'educonnect-auth-system'
      },
      global: {
        headers: {
          'X-Client-Info': 'educonnect-auth-system/1.0.0'
        }
      }
    });
  }
  return supabaseClient;
}

// Inicializa o cliente com service key (admin)
function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
        storageKey: 'educonnect-admin-system'
      },
      global: {
        headers: {
          'X-Client-Info': 'educonnect-auth-system/1.0.0'
        }
      }
    });
  }
  return supabaseAdminClient;
}

/**
 * User authentication options
 */
interface UserAuthOptions {
  phone?: string;
  full_name: string;
  user_type: string;
}

/**
 * Authentication methods
 */
const supabaseAuth = {
  client: getSupabaseClient(),

  signUp: async (email: string, password: string, options: UserAuthOptions) => {
    try {
      const phone = options.phone?.replace(/\s/g, '');
      const formattedPhone = phone?.startsWith('+44') ? phone : phone ? `+44${phone}` : undefined;

      const { data: authData, error: authError } = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: options.full_name,
            user_type: options.user_type,
            phone: formattedPhone
          }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await getSupabaseClient().from('profiles').insert({
          user_id: authData.user.id,
          full_name: options.full_name,
          phone: formattedPhone,
          user_type: options.user_type
        });

        if (profileError) {
          console.warn('Signup succeeded, but profile creation failed:', profileError);
        }
      }

      return authData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { data: null, error };
    }
  },

  signOut: async () => {
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await getSupabaseClient().auth.getSession();
    return { session, error };
  }
};

/**
 * Exported Supabase interface
 */
export const supabase = {
  client: getSupabaseClient(),
  admin: getSupabaseAdminClient(),
  auth: supabaseAuth,
  from: (table: string) => getSupabaseClient().from(table)
};

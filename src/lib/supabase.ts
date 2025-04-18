import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'educonnect-auth-system',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'educonnect-auth-system/1.0.0'
    }
  }
});

// Configure auth state change listener
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event);
  
  // Update user metadata after auth state change
  if (session?.user) {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
    } else if (user) {
      // Update user metadata if needed
      await supabaseClient.auth.updateUser({
        data: {
          ...user.user_metadata,
          user_type: user.user_metadata?.user_type || 'student'
        }
      });
    }
  }
});

export const supabase = {
  auth: {
    signUp: async (email: string, password: string, options: any) => {
      try {
        // Format phone number
        let phone = options.phone?.replace(/\s/g, '');
        if (phone && !phone.startsWith('+44')) {
          phone = '+44' + phone;
        }

        // First, create the user with basic auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: options.full_name,
              user_type: options.user_type,
              phone: phone
            }
          }
        });

        if (authError) {
          console.error('Signup error:', authError);
          throw authError;
        }

        // Create user profile
        if (authData?.user) {
          const { error: profileError } = await supabaseClient.from('profiles').insert({
            user_id: authData.user.id,
            full_name: options.full_name,
            phone: phone,
            user_type: options.user_type
          });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here as we want to continue with the signup
            console.warn('Failed to create user profile, but signup was successful');
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
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error('Signin error:', error);
        return { data: null, error };
      }
    },

    signOut: async () => {
      try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Signout error:', error);
        throw error;
      }
    },

    getSession: async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Get session error:', error);
        throw error;
      }
    }
  },

  from: (table: string) => {
    return supabaseClient.from(table);
  }
};

export const supabaseAdmin = createClient(
  supabaseUrl,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'educonnect-auth-system/1.0.0'
      }
    }
  }
);

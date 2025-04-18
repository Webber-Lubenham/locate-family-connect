import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be less than 64 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Environment Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  throw new Error('Missing Supabase configuration');
}

// Custom error class for authentication
class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const supabaseClientSingleton = (() => {
  let clientInstance: SupabaseClient | null = null;
  let adminClientInstance: SupabaseClient | null = null;
  let clientInitializing = false;
  let adminClientInitializing = false;

  interface ExtendedWindow extends Window {
    __supabaseMainClient?: SupabaseClient;
    __supabaseAdminClient?: SupabaseClient;
    __supabaseClients?: SupabaseClient[];
    __supabaseInitialized?: boolean;
  }

  const createSingletonClient = (
    url: string,
    key: string,
    options: Parameters<typeof createClient>[2] = {},
    type: 'client' | 'admin'
  ): SupabaseClient => {
    const globalKey = type === 'client' ? '__supabaseMainClient' : '__supabaseAdminClient';
    const window$ = window as ExtendedWindow;

    const appName = 'educonnect';
    const env = import.meta.env.MODE || 'development';
    const storageKey = `${appName}-${type}-${env}-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;

    if ((type === 'client' && clientInitializing) || (type === 'admin' && adminClientInitializing)) {
      throw new Error(`Supabase ${type} client initialization already in progress`);
    }

    if (window$[globalKey]) {
      console.warn(`Reusing existing ${type} Supabase client`);
      return window$[globalKey]!;
    }

    if (type === 'client') {
      clientInitializing = true;
    } else {
      adminClientInitializing = true;
    }

    try {
      const newClient = createClient(url, key, {
        ...options,
        auth: {
          ...(options?.auth || {}),
          storageKey,
          persistSession: type === 'client',
          autoRefreshToken: true,
          detectSessionInUrl: type === 'client',
        },
        global: {
          ...(options?.global || {}),
          headers: {
            ...(options?.global?.headers || {}),
            'X-Client-Type': type,
            'X-Client-Info': `educonnect-${type}-system/1.0.0`
          }
        },
        db: {
          schema: 'public'
        }
      });

      Object.defineProperties(newClient, {
        supabaseUrl: { value: url, writable: false, enumerable: false },
        supabaseKey: { value: key, writable: false, enumerable: false },
        clientType: { value: type, writable: false, enumerable: false },
        storageKey: { value: storageKey, writable: false, enumerable: false }
      });

      // Remove existing clients from window to prevent duplicates
      if (window$.__supabaseClients) {
        window$.__supabaseClients = window$.__supabaseClients.filter(client => client !== newClient);
      } else {
        window$.__supabaseClients = [];
      }

      window$[globalKey] = newClient;
      window$.__supabaseInitialized = true;
      window$.__supabaseClients.push(newClient);

      return newClient;
    } finally {
      if (type === 'client') {
        clientInitializing = false;
      } else {
        adminClientInitializing = false;
      }
    }
  };

  return {
    getClient: () => {
      if (!clientInstance) {
        clientInstance = createSingletonClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            flowType: 'pkce',
            storage: {
              getItem: (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
              setItem: (key: string, value: string) => localStorage.setItem(key, JSON.stringify(value)),
              removeItem: (key: string) => localStorage.removeItem(key)
            }
          },
          global: {
            headers: {
              'X-Client-Purpose': 'main-application'
            }
          }
        }, 'client');
      }
      return clientInstance;
    },

    getAdminClient: () => {
      if (!adminClientInstance) {
        adminClientInstance = createSingletonClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            storage: {
              getItem: (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
              setItem: (key: string, value: string) => localStorage.setItem(key, JSON.stringify(value)),
              removeItem: (key: string) => localStorage.removeItem(key)
            }
          },
          global: {
            headers: {
              'X-Client-Purpose': 'admin-operations'
            }
          }
        }, 'admin');
      }
      return adminClientInstance;
    },

    cleanup: () => {
      const window$ = window as ExtendedWindow;
      window$.__supabaseMainClient = undefined;
      window$.__supabaseAdminClient = undefined;
      clientInstance = null;
      adminClientInstance = null;
      if (window$.__supabaseClients) {
        window$.__supabaseClients = [];
      }
    }
  };
})();

function getSupabaseClient(): SupabaseClient {
  return supabaseClientSingleton.getClient();
}

function getSupabaseAdminClient(): SupabaseClient {
  return supabaseClientSingleton.getAdminClient();
}

interface UserAuthOptions {
  phone?: string;
  full_name: string;
  user_type: string;
}

const formatPhone = (raw: string) => {
  const clean = raw.replace(/\s/g, '');
  return clean.startsWith('+') ? clean : `+44${clean}`;
};

const supabaseAuth = {
  client: getSupabaseClient(),

  signUp: async (email: string, password: string, options: UserAuthOptions) => {
    try {
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);

      const formattedPhone = options.phone ? phoneSchema.parse(formatPhone(options.phone)) : undefined;

      if (!options.full_name || !options.user_type) {
        throw new AuthenticationError('Full name and user type are required', 'INVALID_INPUT');
      }

      const { data: authData, error: authError } = await getSupabaseClient().auth.signUp({
        email: validatedEmail,
        password: validatedPassword,
        options: {
          data: {
            full_name: options.full_name,
            user_type: options.user_type,
            phone: formattedPhone
          }
        }
      });

      if (authError) {
        throw new AuthenticationError(authError.message || 'Signup failed', authError.code);
      }

      if (!authData?.user) {
        throw new AuthenticationError('User creation failed', 'USER_NOT_CREATED');
      }

      const { error: profileError } = await getSupabaseClient().from('profiles').insert({
        user_id: authData.user.id,
        full_name: options.full_name,
        phone: formattedPhone,
        user_type: options.user_type
      });

      if (profileError) {
        console.warn('Signup succeeded, but profile creation failed:', profileError);
      }

      return authData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
      }
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);

      const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email: validatedEmail,
        password: validatedPassword
      });

      if (error) {
        throw new AuthenticationError(error.message || 'Signin failed', error.code);
      }

      return { data, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
      }
      throw error;
    }
  },

  signOut: async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      throw new AuthenticationError(error.message || 'Signout failed', error.code);
    }
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await getSupabaseClient().auth.getSession();
    if (error) {
      throw new AuthenticationError(error.message || 'Failed to get session', error.code);
    }
    return { session, error: null };
  }
};

export const supabase = {
  client: getSupabaseClient(),
  admin: getSupabaseAdminClient(),
  getClient: getSupabaseClient,
  getAdminClient: getSupabaseAdminClient,
  auth: supabaseAuth,
  from: (table: string) => getSupabaseClient().from(table)
};

export { supabaseClientSingleton };
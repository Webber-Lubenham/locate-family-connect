
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

export type User = {
  id: string;
  email: string;
  user_type: string;
  avatar_url?: string;
  full_name?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const getUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_type: userProfile?.user_type || 'student',
            full_name: userProfile?.full_name,
            avatar_url: userProfile?.avatar_url
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Get user profile
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                user_type: profile?.user_type || 'student',
                full_name: profile?.full_name,
                avatar_url: profile?.avatar_url
              });
            });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AUTH] Iniciando signIn com Supabase para email:', email);
    try {
      console.log('[AUTH] Chamando supabase.auth.signInWithPassword...');
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('[AUTH] Resultado do signInWithPassword:', { 
        success: !result.error,
        errorType: result.error?.name,
        errorMessage: result.error?.message
      });
      
      if (result.error) {
        console.error('[AUTH] Detalhes do erro:', result.error);
      } else {
        console.log('[AUTH] Login bem-sucedido, session:', !!result.data.session);
      }
      
      return result;
    } catch (error) {
      console.error('[AUTH] Exceção durante signIn:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: object) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

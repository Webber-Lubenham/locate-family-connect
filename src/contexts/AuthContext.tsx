import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Define extended user type to include additional properties
export interface ExtendedUser extends User {
  user_type?: string;
  full_name?: string;
}

// Define the context type
interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  forgotPassword: (email: string) => Promise<{ error: any | null }>; // Add this line
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[AUTH] Setting up auth state listener');
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`[AUTH] Auth state changed: ${event}`, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user as ExtendedUser || null);
        
        if (currentSession?.user && event === 'SIGNED_IN') {
          // Get user profile data on sign in, using setTimeout to avoid potential Supabase deadlocks
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .single();
              
              if (profile) {
                // Update user with profile data
                setUser(prev => prev ? {
                  ...prev,
                  user_type: profile.user_type,
                  full_name: profile.full_name
                } : null);
                
                console.log('[AUTH] Retrieved profile:', profile);
              } else {
                console.log('[AUTH] No profile found for user');
              }
            } catch (error) {
              console.error('[AUTH] Error fetching user profile:', error);
            }
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('[AUTH] Initial session check:', currentSession?.user?.id);
      
      setSession(currentSession);
      setUser(currentSession?.user as ExtendedUser || null);
      
      if (currentSession?.user) {
        // Get user profile data for existing session
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('[AUTH] Error fetching profile:', error);
              return;
            }
            
            if (profile) {
              // Update user with profile data
              setUser(prev => prev ? {
                ...prev,
                user_type: profile.user_type,
                full_name: profile.full_name
              } : null);
              
              console.log('[AUTH] Retrieved initial profile:', profile);
            }
          });
      }
      
      setLoading(false);
    });

    // Clean up subscription when component unmounts
    return () => {
      console.log('[AUTH] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AUTH] Attempting sign in for:', email);
    setLoading(true);
    
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        console.error('[AUTH] Sign in error:', result.error);
        toast({
          title: "Erro ao fazer login",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('[AUTH] Sign in successful:', result.data.user?.id);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
          variant: "default"
        });
      }
      
      return { error: result.error };
    } catch (error: any) {
      console.error('[AUTH] Exception during sign in:', error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro durante o login",
        variant: "destructive"
      });
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: object) => {
    console.log('[AUTH] Attempting sign up for:', email);
    setLoading(true);
    
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (result.error) {
        console.error('[AUTH] Sign up error:', result.error);
        toast({
          title: "Erro ao criar conta",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('[AUTH] Sign up successful:', result.data.user?.id);
        toast({
          title: "Cadastro realizado",
          description: "Sua conta foi criada com sucesso!",
          variant: "default"
        });
      }
      
      return { error: result.error };
    } catch (error: any) {
      console.error('[AUTH] Exception during sign up:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro durante o cadastro",
        variant: "destructive"
      });
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('[AUTH] Signing out');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('[AUTH] Sign out successful');
    } catch (error) {
      console.error('[AUTH] Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    console.log('[AUTH] Attempting password reset for:', email);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      
      if (error) {
        console.error('[AUTH] Password reset error:', error);
        toast({
          title: "Erro ao enviar email de recuperação",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('[AUTH] Password reset email sent successfully');
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha",
          variant: "default"
        });
      }
      
      return { error };
    } catch (error: any) {
      console.error('[AUTH] Exception during password reset:', error);
      toast({
        title: "Erro ao enviar email de recuperação",
        description: error.message || "Ocorreu um erro ao processar a solicitação",
        variant: "destructive"
      });
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword // Add this to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export UnifiedAuthProvider for backward compatibility
export const UnifiedAuthProvider = AuthProvider;

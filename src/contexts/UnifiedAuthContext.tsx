
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import type { ExtendedUser } from './AuthContext';

// Re-export ExtendedUser type
export type { ExtendedUser };

type UnifiedAuthContextType = {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  userProfile: any;
  forgotPassword: (email: string) => Promise<{ error: any | null }>; 
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[UNIFIED AUTH] Setting up auth state listener');
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`[UNIFIED AUTH] Auth state changed: ${event}`, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user as ExtendedUser || null);
        
        if (currentSession?.user && event === 'SIGNED_IN') {
          // Get user profile data on sign in
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
                
                console.log('[UNIFIED AUTH] Retrieved profile:', profile);
              } else {
                console.log('[UNIFIED AUTH] No profile found for user');
              }
            } catch (error) {
              console.error('[UNIFIED AUTH] Error fetching user profile:', error);
            }
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('[UNIFIED AUTH] Initial session check:', currentSession?.user?.id);
      
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
              console.error('[UNIFIED AUTH] Error fetching profile:', error);
              return;
            }
            
            if (profile) {
              // Update user with profile data
              setUser(prev => prev ? {
                ...prev,
                user_type: profile.user_type,
                full_name: profile.full_name
              } : null);
              
              console.log('[UNIFIED AUTH] Retrieved initial profile:', profile);
            }
          });
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[UNIFIED AUTH] Attempting sign in for:', email);
    setLoading(true);
    
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.error) {
        console.error('[UNIFIED AUTH] Sign in error:', result.error);
        toast({
          title: "Erro ao fazer login",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('[UNIFIED AUTH] Sign in successful:', result.data.user?.id);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
          variant: "default"
        });
      }
      
      return { error: result.error };
    } catch (error: any) {
      console.error('[UNIFIED AUTH] Exception during sign in:', error);
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
    console.log('[UNIFIED AUTH] Attempting sign up for:', email);
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
        console.error('[UNIFIED AUTH] Sign up error:', result.error);
        toast({
          title: "Erro ao criar conta",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('[UNIFIED AUTH] Sign up successful:', result.data.user?.id);
        toast({
          title: "Cadastro realizado",
          description: "Sua conta foi criada com sucesso!",
          variant: "default"
        });
      }
      
      return { error: result.error };
    } catch (error: any) {
      console.error('[UNIFIED AUTH] Exception during sign up:', error);
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
    console.log('[UNIFIED AUTH] Signing out');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('[UNIFIED AUTH] Sign out successful');
    } catch (error) {
      console.error('[UNIFIED AUTH] Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    console.log('[UNIFIED AUTH] Attempting password reset for:', email);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      
      if (error) {
        console.error('[UNIFIED AUTH] Password reset error:', error);
        toast({
          title: "Erro ao enviar email de recuperação",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('[UNIFIED AUTH] Password reset email sent successfully');
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha",
          variant: "default"
        });
      }
      
      return { error };
    } catch (error: any) {
      console.error('[UNIFIED AUTH] Exception during password reset:', error);
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

  const value: UnifiedAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    userProfile: user,
    forgotPassword
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// Export the hook that will be used throughout the app
export const useUser = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UnifiedAuthProvider');
  }
  return context;
};

// Legacy exports for backward compatibility
export const UserProvider = UnifiedAuthProvider;

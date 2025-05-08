
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { UserType, isValidUserType } from '@/lib/auth-redirects';

// Extended user type with additional properties
export type ExtendedUser = User & {
  user_type?: UserType;
  full_name?: string;
};

type UnifiedAuthContextType = {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  forgotPassword: (email: string) => Promise<{ error: any | null }>;
  session: Session | null;
  fetchUserType: () => Promise<void>;
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

const handleAuthError = (error: any, message: string, toast: any) => {
  console.error('[UNIFIED AUTH] Error:', error);
  toast({
    title: 'Erro',
    description: message || error.message,
    variant: 'destructive'
  });
};

const handleAuthSuccess = (toast: any, title: string, description: string) => {
  toast({
    title,
    description
  });
};

const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('[UNIFIED AUTH] Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[UNIFIED AUTH] Error fetching profile:', error);
        return null;
      }

      if (!profile?.user_type) {
        console.warn('[UNIFIED AUTH] Profile exists but no user_type found');
      }

      console.log('[UNIFIED AUTH] Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('[UNIFIED AUTH] Exception fetching profile:', error);
      return null;
    }
  };

  const authOperation = async (operation: string, action: Promise<any>, successMessage: string, errorMessage: string) => {
    try {
      setLoading(true);
      const result = await action;

      if (result.error) {
        handleAuthError(result.error, errorMessage, toast);
        return { error: result.error };
      }

      handleAuthSuccess(toast, successMessage, operation);
      return { error: null };
    } catch (error) {
      handleAuthError(error, errorMessage, toast);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    return authOperation(
      'Login',
      supabase.auth.signInWithPassword({
        email,
        password
      }),
      'Login bem-sucedido',
      'Erro no login'
    );
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      handleAuthSuccess(toast, 'Logout bem-sucedido', 'Você foi desconectado com sucesso.');
    } catch (error) {
      handleAuthError(error, 'Erro no logout', toast);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: object) => {
    return authOperation(
      'Registro',
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      }),
      'Registro bem-sucedido',
      'Erro no registro'
    );
  };

  const forgotPassword = async (email: string) => {
    return authOperation(
      'Recuperação',
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      }),
      'Email enviado',
      'Erro na recuperação'
    );
  };

  useEffect(() => {
    console.log('[UNIFIED AUTH] Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`[UNIFIED AUTH] Auth state changed: ${event}`, currentSession?.user?.id);
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id);
          const userMetadataType = currentSession.user.user_metadata?.user_type as string;
          const appMetadataType = currentSession.user.app_metadata?.user_type as string;
          
          // Determine user type, ensuring it's a valid type
          let userType: UserType | undefined;
          
          if (profile?.user_type && isValidUserType(profile.user_type)) {
            userType = profile.user_type as UserType;
          } else if (isValidUserType(userMetadataType)) {
            userType = userMetadataType as UserType;
          } else if (isValidUserType(appMetadataType)) {
            userType = appMetadataType as UserType;
          }
          
          setUser({
            ...currentSession.user,
            user_type: userType
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          const userMetadataType = session.user.user_metadata?.user_type as string;
          const appMetadataType = session.user.app_metadata?.user_type as string;
          
          // Determine user type, ensuring it's a valid type
          let userType: UserType | undefined;
          
          if (profile?.user_type && isValidUserType(profile.user_type)) {
            userType = profile.user_type as UserType;
          } else if (isValidUserType(userMetadataType)) {
            userType = userMetadataType as UserType;
          } else if (isValidUserType(appMetadataType)) {
            userType = appMetadataType as UserType;
          }

          if (userType) {
            setUser({
              ...session.user,
              user_type: userType
            });
          } else {
            setUser(session.user);
          }
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });
  }, []);

  const fetchUserType = async () => {
    if (!user) return;

    try {
      const profile = await fetchUserProfile(user.id);
      const userMetadataType = user.user_metadata?.user_type as string;
      const appMetadataType = user.app_metadata?.user_type as string;
      
      // Determine user type, ensuring it's a valid type
      let userType: UserType | undefined;
      
      if (profile?.user_type && isValidUserType(profile.user_type)) {
        userType = profile.user_type as UserType;
      } else if (isValidUserType(userMetadataType)) {
        userType = userMetadataType as UserType;
      } else if (isValidUserType(appMetadataType)) {
        userType = appMetadataType as UserType;
      }

      if (userType) {
        setUser(prev => prev ? {
          ...prev,
          user_type: userType
        } : null);
      }
    } catch (error) {
      console.error('[UNIFIED AUTH] Error fetching user type:', error);
    }
  };

  const value: UnifiedAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    forgotPassword,
    session,
    fetchUserType
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthProvider;

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
  error: any | null;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  forgotPassword: (email: string) => Promise<{ error: any | null }>;
  session: Session | null;
  fetchUserType: () => Promise<void>;
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

const handleAuthError = (error: any, message: string, toast: any) => {
  console.error('[UNIFIED AUTH][handleAuthError] Error:', error, 'Message:', message);
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
  const [error, setError] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[MCP][UnifiedAuthContext] Loading state changed to:', loading);
    if (!loading) {
      console.log('[MCP][UnifiedAuthContext] Current state after loading:', { user, session, error });
    }
  }, [loading]);

  useEffect(() => {
    console.log('[MCP][UnifiedAuthContext] User state changed to:', user);
    if (user) {
      console.log('[MCP][UnifiedAuthContext] User session details:', { id: user.id, email: user.email, user_metadata: user.user_metadata });
    }
  }, [user]);

  useEffect(() => {
    console.log('[MCP][UnifiedAuthContext] Error state changed to:', error);
  }, [error]);

  const fetchUserProfile = async (userId: string) => {
    console.log('[MCP][fetchUserProfile] Attempting to fetch profile for user ID:', userId);
    let profileData = null;
    let profileError = null;

    try {
      console.log('[MCP][fetchUserProfile] Executing Supabase query for profiles (sem .single())...');
      // Removido .single() para teste, esperando um array
      const { data: profilesArray, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);
      
      // profileData = data; // Ajustar para lidar com array
      profileError = error;

      if (profileError) {
        console.error('[MCP][fetchUserProfile] Supabase query (array) returned an error:', profileError);
        setError(profileError);
        return null;
      }

      if (!profilesArray || profilesArray.length === 0) {
        console.warn('[MCP][fetchUserProfile] Supabase query (array) returned no data (profile not found) for user ID:', userId);
        return null;
      }

      if (profilesArray.length > 1) {
        console.warn('[MCP][fetchUserProfile] Supabase query (array) returned multiple profiles for user ID:', userId, 'Profiles:', profilesArray);
        // Decidir qual perfil usar ou tratar como erro, por enquanto pegar o primeiro
      }
      
      profileData = profilesArray[0]; // Pegar o primeiro perfil do array

      if (!profileData.user_type) {
        console.warn('[MCP][fetchUserProfile] Profile fetched (from array) for user ID:', userId, 'but user_type is missing. Profile:', profileData);
      }

      console.log('[MCP][fetchUserProfile] Profile fetched successfully (from array) via Supabase for user ID:', userId, 'Profile data:', profileData);
      setError(null);
      return profileData;

    } catch (catchedError) {
      console.error('[MCP][fetchUserProfile] Exception during Supabase query execution (array) for user ID:', userId, 'Error:', catchedError);
      setError(catchedError);
      return null;
    }
  };

  const authOperation = async (operation: string, action: Promise<any>, successMessage: string, errorMessage: string) => {
    console.log(`[MCP][authOperation] Starting operation: ${operation}`);
    // setError(null); // Clear error before new operation
    // setLoading(true); // setLoading is handled by individual functions like signIn now
    try {
      const result = await action;
      if (result.error) {
        console.error(`[MCP][authOperation] Error in ${operation}:`, result.error);
        setError(result.error);
        handleAuthError(result.error, errorMessage, toast);
        return { error: result.error };
      }
      console.log(`[MCP][authOperation] ${operation} successful.`);
      setError(null);
      handleAuthSuccess(toast, successMessage, operation);
      return { error: null };
    } catch (catchedError) {
      console.error(`[MCP][authOperation] Exception in ${operation}:`, catchedError);
      setError(catchedError);
      handleAuthError(catchedError, errorMessage, toast);
      return { error: catchedError };
    } finally {
      // setLoading(false); // setLoading is handled by individual functions like signIn now
      console.log(`[MCP][authOperation] Finished operation: ${operation}`);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[MCP][signIn] Attempting sign in...');
    setLoading(true);
    const result = await authOperation(
      'Login',
      supabase.auth.signInWithPassword({
        email,
        password
      }),
      'Login bem-sucedido',
      'Erro no login'
    );
    // setLoading(false) é chamado implicitamente por onAuthStateChange após o login
    // mas se o login falhar antes de onAuthStateChange, loading pode ficar true.
    // No entanto, onAuthStateChange DEVE ser acionado mesmo em falha de login (para USER_MODIFIED ou similar)
    // Se signInWithPassword falhar (ex: credenciais erradas), o onAuthStateChange pode não ser acionado para SIGNED_IN.
    // A lógica de setLoading no onAuthStateChange deveria cuidar disso, mas é bom garantir.
    if (result.error) {
        setLoading(false); // Garante que o loading termine se o login falhar diretamente.
    }
    return result;
  };

  const signOut = async () => {
    console.log('[MCP][signOut] Attempting sign out...');
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // setUser(null) e setSession(null) serão feitos pelo onAuthStateChange
      handleAuthSuccess(toast, 'Logout bem-sucedido', 'Você foi desconectado com sucesso.');
      setError(null);
    } catch (error) {
      console.error('[MCP][signOut] Error during sign out:', error);
      handleAuthError(error, 'Erro no logout', toast);
      setError(error);
    } finally {
      console.log('[MCP][signOut] Sign out process finished. Setting loading to false.');
      setLoading(false); // onAuthStateChange cuidará de setUser e setSession
    }
  };

  const signUp = async (email: string, password: string, userData: object) => {
    console.log('[MCP][signUp] Attempting sign up...');
    setLoading(true);
    const result = await authOperation(
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
    if (result.error) {
        setLoading(false); 
    }
    return result;
  };

  const forgotPassword = async (email: string) => {
    console.log('[MCP][forgotPassword] Attempting password recovery...');
    setLoading(true);
    const result = await authOperation(
      'Recuperação',
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      }),
      'Email enviado',
      'Erro na recuperação'
    );
    // setLoading(false) será chamado no finally do authOperation se não houver erro de rede
    // ou no catch, mas se a operação for bem sucedida, o loading permanece true até o authOperation.
    // authOperation agora não mexe em setLoading por si só para as operações principais.
    setLoading(false); // Garante que o loading termine após esta operação.
    return result;
  };

  useEffect(() => {
    console.log('[MCP][UnifiedAuthContext][onAuthStateChange Effect] Setting up auth state listener. Initializing loading to true.');
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`[MCP][UnifiedAuthContext][onAuthStateChange Callback] Event: ${event}, User ID: ${currentSession?.user?.id}`);
        setSession(currentSession);
        let profileFetched = false;
        try {
          if (currentSession?.user) {
            const profile = await fetchUserProfile(currentSession.user.id);
            profileFetched = true; // Marcar que o fetch foi tentado
            const userMetadataType = currentSession.user.user_metadata?.user_type as string;
            const appMetadataType = currentSession.user.app_metadata?.user_type as string;
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
              user_type: userType,
              full_name: profile?.full_name
            });
            console.log('[MCP][UnifiedAuthContext][onAuthStateChange Callback] User state set after profile fetch.');
            setError(null);
          } else {
            console.log('[MCP][UnifiedAuthContext][onAuthStateChange Callback] No current session user. Setting user to null.');
            setUser(null);
          }
        } catch (e) {
          console.error('[MCP][UnifiedAuthContext][onAuthStateChange Callback] Error processing auth state change:', e);
          setError(e);
          setUser(null);
        } finally {
          console.log(`[MCP][UnifiedAuthContext][onAuthStateChange Callback] Finally block. Profile fetched attempt: ${profileFetched}. Setting loading to false.`);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('[MCP][UnifiedAuthContext][onAuthStateChange Effect] Unsubscribing from auth state changes.');
      subscription.unsubscribe();
    };
  }, []);

  // Removendo o segundo useEffect que chamava getSession para evitar duplicação de lógica e potenciais corridas de estado.
  // onAuthStateChange deve ser suficiente para lidar com o estado inicial e subsequentes mudanças.
  // Se houver casos onde getSession é estritamente necessário na montagem (ex: SSR ou cenários específicos de refresh),
  // ele precisaria ser cuidadosamente coordenado com o onAuthStateChange para gerenciar o estado de 'loading'.

  const fetchUserType = async () => {
    if (!user) {
      console.log('[MCP][fetchUserType] No user, cannot fetch type.');
      return;
    }
    console.log('[MCP][fetchUserType] Attempting to fetch user type for current user:', user.id);
    // setLoading(true); // Potencialmente definir loading se esta for uma operação demorada independente
    try {
      const profile = await fetchUserProfile(user.id);
      const userMetadataType = user.user_metadata?.user_type as string;
      const appMetadataType = user.app_metadata?.user_type as string;
      let userType: UserType | undefined;
      if (profile?.user_type && isValidUserType(profile.user_type)) {
        userType = profile.user_type as UserType;
      } else if (isValidUserType(userMetadataType)) {
        userType = userMetadataType as UserType;
      } else if (isValidUserType(appMetadataType)) {
        userType = appMetadataType as UserType;
      }

      if (userType) {
        console.log('[MCP][fetchUserType] User type determined:', userType, 'Updating user state.');
        setUser(prev => prev ? { ...prev, user_type: userType } : null);
      } else {
        console.warn('[MCP][fetchUserType] User type could not be determined from profile or metadata.');
      }
    } catch (error) {
      console.error('[MCP][fetchUserType] Exception fetching user type:', error);
      setError(error); // Informar sobre o erro
    } finally {
      // setLoading(false); // Potencialmente definir loading se esta for uma operação demorada independente
      console.log('[MCP][fetchUserType] Finished attempt to fetch user type.');
    }
  };

  const value: UnifiedAuthContextType = {
    user,
    loading,
    error,
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

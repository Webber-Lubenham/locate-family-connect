import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserType } from '../types';

// Usando o mesmo tipo de usuário definido em types/index.ts

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  userType: UserType | null;
  logAuthEvent: (eventType: string, metadata?: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listener para mudanças de autenticação - parte fundamental do fluxo PKCE
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Log do evento para diagnóstico (compatível com auth_logs da versão web)
        logAuthEvent(event, { userId: session?.user?.id });
        
        setUser(session?.user || null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserType(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Buscar perfil do usuário - usa a tabela profiles conforme definido no modelo de dados
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUserType(data.user_type as UserType);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      // Log do erro para diagnóstico
      logAuthEvent('profile_fetch_error', { userId, error });
    }
  };

  // Login com email/senha usando o fluxo PKCE do Supabase
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        logAuthEvent('signin_error', { email, error: error.message });
        return { error };
      }
      
      logAuthEvent('signin_success', { email });
      return { error: null };
    } catch (error: any) {
      logAuthEvent('signin_exception', { email, error: error.message });
      return { error };
    }
  };

  // Logout
  const signOut = async () => {
    logAuthEvent('signout', { userId: user?.id });
    await supabase.auth.signOut();
  };

  // Função para registrar eventos de autenticação - compatível com auth_logs
  const logAuthEvent = async (eventType: string, metadata: any = {}) => {
    try {
      await supabase.rpc('log_auth_event', {
        p_event_type: eventType,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Erro ao registrar evento de autenticação:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      userType,
      logAuthEvent
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

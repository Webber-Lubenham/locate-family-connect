
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Tipos
export type UserProfile = {
  id: number;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  phone_country?: string;
  created_at: string;
  updated_at: string;
  user_type: string;
};

type UnifiedAuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: any }>;
  resetPassword: (password: string) => Promise<{ error: any }>;
  updateUser: (user: SupabaseUser) => void;
  setUser: React.Dispatch<React.SetStateAction<SupabaseUser | null>>;
  refreshSession: () => Promise<boolean>;
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) return null;
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          return await createUserProfile(userId);
        }
        return null;
      }
      if (!profileData || !profileData.id) {
        toast({ title: 'Erro ao carregar perfil', description: 'Não foi possível carregar seu perfil.', variant: 'destructive' });
        return null;
      }
      return profileData;
    } catch (error) {
      toast({ title: 'Erro ao carregar perfil', description: 'Não foi possível carregar seu perfil.', variant: 'destructive' });
      return null;
    }
  }, [toast]);

  // Create user profile
  const createUserProfile = useCallback(async (userId: string) => {
    if (!userId) return null;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userMeta = userData?.user?.user_metadata || {};
      const newProfile = {
        user_id: userId,
        full_name: userMeta.full_name || '',
        phone: userMeta.phone || null,
        user_type: userMeta.user_type || 'student',
      };
      const { data: createdProfile, error } = await supabase
        .from('profiles')
        .insert([newProfile]);
      if (error) return null;
      if (!createdProfile) {
        const { data: fetchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        return fetchedProfile;
      }
      return createdProfile[0];
    } catch {
      return null;
    }
  }, []);

  // Atualiza usuário (compat)
  const updateUser = useCallback((userData: SupabaseUser) => {
    setUser(userData);
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setUser(null);
      setUserProfile(null);
      await supabase.auth.signOut();
      toast({ title: 'Logout realizado com sucesso', description: 'Você foi desconectado da sua conta' });
      window.location.href = '/login';
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao fazer logout', description: 'Não foi possível desconectar. Tente novamente.' });
    }
  }, [toast]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) return false;
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Métodos de autenticação
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };
  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
    return { error };
  };
  const resetPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  // Efeito para manter sessão e perfil sincronizados
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchUserProfile(user.id).then((profile) => {
        setUserProfile(profile);
        setLoading(false);
      });
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user, fetchUserProfile]);

  const value: UnifiedAuthContextType = {
    session,
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    updateUser,
    setUser,
    refreshSession,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// Hook principal
export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (!context) throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  return context;
}

// Compatibilidade: useUser e useAuth
export const useUser = useUnifiedAuth;
export const useAuth = useUnifiedAuth;

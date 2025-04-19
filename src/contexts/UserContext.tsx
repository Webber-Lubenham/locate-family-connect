
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from '../lib/supabase';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  user_type: string;
  phone: string;
  created_at: string;
  // Add missing properties used in our components
  name?: string;
  email?: string;
  role?: string;
  phone_country?: string;
}

interface ExtendedUser extends User {
  profile?: Profile;
  user_type?: string;
  full_name?: string;
  phone?: string;
  metadata?: {
    full_name?: string;
    user_type?: string;
    phone?: string;
  };
}

interface UserContextType {
  session: Session | null;
  user: ExtendedUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<ExtendedUser>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const client = supabase.client;

  // Função para atualizar o estado do usuário
  const updateUser = async (userData: Partial<ExtendedUser>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        ...userData
      };
    });
  };

  // Função para buscar perfil do usuário com tratamento de erros aprimorado
  const fetchUserProfile = useCallback(async (userId: string) => {
    // Limitar o número de tentativas para evitar loops infinitos
    if (fetchAttempts >= 3) {
      console.log("Máximo de tentativas de busca de perfil atingido");
      setLoading(false);
      return;
    }

    try {
      // Verificar se já temos um perfil antes de buscar
      if (profile && profile.user_id === userId) {
        setLoading(false);
        return;
      }

      setFetchAttempts(prev => prev + 1);
      
      let profileData;
      
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Se não existir perfil, criar um básico
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, tentando criar um novo perfil');
          
          const newProfile: Partial<Profile> = {
            user_id: userId,
            full_name: user?.user_metadata?.full_name || 'New User',
            user_type: user?.user_metadata?.user_type || 'student',
            phone: user?.user_metadata?.phone || '',
            created_at: new Date().toISOString(),
          };

          // Tentar inserir o novo perfil
          const { data: insertedProfile, error: insertError } = await client
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            
            toast({
              title: "Erro ao criar perfil",
              description: "Não foi possível criar seu perfil. Por favor, tente novamente.",
              variant: "destructive",
            });
            
            setLoading(false);
            return;
          }

          // Usar o perfil inserido
          profileData = insertedProfile;
        } else {
          console.error('Erro ao buscar perfil:', error);
          
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar seu perfil. Por favor, tente novamente.",
            variant: "destructive",
          });
          
          setLoading(false);
          return;
        }
      } else {
        // Use os dados retornados da consulta
        profileData = data;
      }

      if (profileData) {
        const profileObj = {
          id: profileData.id as string,
          user_id: profileData.user_id as string,
          full_name: profileData.full_name as string,
          user_type: profileData.user_type as string,
          phone: profileData.phone as string,
          created_at: profileData.created_at as string,
          // Mapear dados do perfil para os campos que nossos componentes esperam
          name: profileData.full_name,
          email: user?.email,
          role: profileData.user_type,
          phone_country: 'UK' // Valor padrão para o formato UK
        } as Profile;

        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            profile: profileObj,
            user_type: profileObj.user_type || 'student',
            full_name: profileObj.full_name,
            phone: profileObj.phone
          };
        });
        
        setProfile(profileObj);
      }
    } catch (error: unknown) {
      console.error('Erro ao buscar/criar perfil:', error instanceof Error ? error.message : error);
      
      // Fallback para um estado de usuário mínimo
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          user_type: user?.user_metadata?.user_type || 'student',
          full_name: user?.user_metadata?.full_name || 'New User'
        };
      });
    } finally {
      setLoading(false);
    }
  }, [client, user, profile, fetchAttempts, toast]);

  // Função para fazer logout
  const signOut = async () => {
    try {
      await client.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível encerrar sua sessão. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const authStateChangeHandler = useCallback(async (_event: string, newSession: Session | null) => {
    setSession(newSession);
    
    if (newSession?.user) {
      setUser(newSession.user);
      await fetchUserProfile(newSession.user.id);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    // Configurar ouvinte de estado de autenticação PRIMEIRO
    const { data: { subscription } } = client.auth.onAuthStateChange(authStateChangeHandler);

    // Verificar sessão existente
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await client.auth.getSession();
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          // Apenas buscar perfil se não tivermos um ou se o ID do usuário mudar
          if (!profile || profile.user_id !== currentSession.user.id) {
            await fetchUserProfile(currentSession.user.id);
          } else {
            setLoading(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [client.auth, authStateChangeHandler, fetchUserProfile, profile]);

  return (
    <UserContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading, 
      signOut,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

  
// Helper function to check if user is authenticated
export const useAuth = () => {
  const { user, session } = useUser();
  
  return React.useMemo(() => ({
    isAuthenticated: !!user,
    user,
    session
  }), [user, session]);
};

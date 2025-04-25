import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { User as SupabaseUser } from '@supabase/supabase-js';

// Define the types for user and profile
export type User = {
  id: string;
  email: string | null;
  user_metadata: any;
  user_type?: string;
  full_name?: string;
  phone?: string;
};

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

// Create context for user and profile data
type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateUser: (user: User) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) return null;

    console.log('Fetching profile for user:', userId);
    
    try {
      const { data: profileData, error } = await supabase.client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Attempt to create the profile if it doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          return await createUserProfile(userId);
        }
        return null;
      }

      // Log perfil retornado
      console.log('Perfil retornado:', profileData);
      // Se perfilData for null ou não tiver id, mostre toast de erro
      if (!profileData || !profileData.id) {
        toast({
          title: 'Erro ao carregar perfil',
          description: 'Não foi possível carregar seu perfil. Tente novamente em alguns instantes.',
          variant: 'destructive',
        });
        return null;
      }
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar seu perfil. Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Function to create a new user profile if it doesn't exist
  const createUserProfile = useCallback(async (userId: string) => {
    if (!userId) return null;
    
    try {
      console.log('Trying to create profile with admin privileges');

      // Get current user metadata
      const { data: userData } = await supabase.client.auth.getUser();
      const userMeta = userData?.user?.user_metadata || {};
      
      const newProfile = {
        user_id: userId,
        full_name: userMeta.full_name || '',
        phone: userMeta.phone || null,
        user_type: userMeta.user_type || 'student',
      };

      // Try to create the profile without select()
      const { data: createdProfile, error } = await supabase.client
        .from('profiles')
        .insert([newProfile]);

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      // If insert successful, fetch the created profile
      if (!createdProfile) {
        const { data: fetchedProfile } = await supabase.client
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        return fetchedProfile;
      }

      return createdProfile[0];
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  // Implement signOut function
  const signOut = useCallback(async () => {
    try {
      console.log('Initiating sign out process');
      // Use the supabase client directly to sign out
      const { error } = await supabase.client.auth.signOut();
      
      if (error) {
        console.error('Error in Supabase signOut:', error);
        throw error;
      }
      
      console.log('Successfully signed out from Supabase');
      
      // Clear user data from context
      setUser(null);
      setProfile(null);
      
      // Show toast notification
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta"
      });
      
      console.log('Redirecting to login page');
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Não foi possível desconectar. Tente novamente."
      });
    }
  }, [toast]);

  // Check for existing session on load
  useEffect(() => {
    console.log('Verificando sessão existente');
    let authListener: any = null;

    const setupAuthListener = async () => {
      try {
        const { data } = await supabase.client.auth.getSession();
        const session = data?.session;
        
        if (session?.user) {
          console.log('Sessão existente encontrada para:', session.user.email);
          // Map Supabase user to our User type
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
            user_type: session.user.user_metadata?.user_type || 'student',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone || null,
          };
          setUser(mappedUser);

          // Fetch profile for the authenticated user
          const profileData = await fetchUserProfile(session.user.id);
          console.log('Profile after fetchUserProfile:', profileData);
          setProfile(profileData);

          // Se profileData não for válido, mostre toast e evite loop
          if (!profileData || !profileData.id) {
            toast({
              title: 'Perfil não encontrado',
              description: 'Seu perfil ainda não está disponível. Aguarde alguns instantes ou entre em contato com o suporte.',
              variant: 'destructive',
            });
          }
        } else {
          console.log('No existing session found');
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, [fetchUserProfile, toast]);

  const value = {
    user,
    profile,
    loading,
    updateUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

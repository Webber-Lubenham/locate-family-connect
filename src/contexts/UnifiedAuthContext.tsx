
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth';

type UnifiedAuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  userProfile: any;
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  const value = {
    user: auth.user,
    loading: auth.isLoading,
    signIn: auth.signIn,
    signOut: auth.signOut,
    signUp: auth.signUp,
    userProfile: auth.user
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


import { useCallback, useEffect, useRef } from 'react';
import { GuardianData } from '@/types/auth';
import { useGuardianData } from '@/hooks/useGuardianData';

export function useGuardianManagement(userId?: string) {
  // Track if we already tried to fetch for this user ID
  const fetchAttemptedRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  const { 
    loading: isLoadingGuardians, 
    error, 
    guardians, 
    fetchGuardians,
    addGuardian, 
    removeGuardian,
    resetErrorState
  } = useGuardianData();
  
  // Handle fetching guardians based on user ID changes
  useEffect(() => {
    // Only fetch if userId is defined and either:
    // 1. We haven't tried fetching yet
    // 2. The userId has changed since our last attempt
    if (userId && (!fetchAttemptedRef.current || userId !== lastUserIdRef.current)) {
      fetchAttemptedRef.current = true;
      lastUserIdRef.current = userId;
      fetchGuardians(userId);
    }
  }, [userId, fetchGuardians]);

  // Wrapper for addGuardian to convert return type
  const handleAddGuardian = async (guardianData: Partial<GuardianData>): Promise<void> => {
    if (userId) {
      // Reset error state when manually adding a guardian
      resetErrorState();
      await addGuardian(userId, guardianData.email || '', guardianData.relationship_type || undefined);
    }
  };

  // Wrapper for removeGuardian to convert return type
  const handleRemoveGuardian = async (id: string): Promise<void> => {
    const guardian = guardians.find(g => g.id === id);
    if (guardian) {
      // Reset error state when manually removing a guardian
      resetErrorState();
      await removeGuardian(guardian);
    }
  };
  
  // Force refresh of guardians list
  const refreshGuardians = useCallback(() => {
    if (userId) {
      fetchAttemptedRef.current = false;
      resetErrorState();
      fetchGuardians(userId);
    }
  }, [userId, fetchGuardians, resetErrorState]);

  return {
    guardians,
    isLoadingGuardians,
    error,
    fetchGuardians,
    handleAddGuardian,
    handleRemoveGuardian,
    refreshGuardians
  };
}


import { useCallback } from 'react';
import { GuardianData } from '@/types/auth';
import { useGuardianData } from '@/hooks/useGuardianData';

export function useGuardianManagement(userId?: string) {
  const { 
    loading: isLoadingGuardians, 
    error, 
    guardians, 
    fetchGuardians,
    addGuardian, 
    removeGuardian
  } = useGuardianData();
  
  // Wrapper for addGuardian to convert return type
  const handleAddGuardian = async (guardianData: Partial<GuardianData>): Promise<void> => {
    if (userId) {
      await addGuardian(userId, guardianData.email || '', guardianData.relationship_type || undefined);
    }
  };

  // Wrapper for removeGuardian to convert return type
  const handleRemoveGuardian = async (id: string): Promise<void> => {
    const guardian = guardians.find(g => g.id === id);
    if (guardian) {
      await removeGuardian(guardian);
    }
  };

  return {
    guardians,
    isLoadingGuardians,
    error,
    fetchGuardians,
    handleAddGuardian,
    handleRemoveGuardian
  };
}

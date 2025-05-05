
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GuardianData } from '@/types/database';

export function useGuardians(studentId: string) {
  return useQuery({
    queryKey: ['guardians', studentId],
    queryFn: async () => {
      // Use the secure RPC function instead of direct table access
      const { data, error } = await supabase.rpc(
        'get_student_guardians_secure',
        { p_student_id: studentId }
      );
      
      if (error) {
        console.error('Error fetching guardians:', error);
        throw error;
      }
      
      return data as GuardianData[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

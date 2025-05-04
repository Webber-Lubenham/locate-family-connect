
import { useQuery } from '@tanstack/react-query';
import { guardianService } from '@/lib/services/guardian/GuardianService';

export function useGuardians(studentId: string) {
  return useQuery({
    queryKey: ['guardians', studentId],
    queryFn: () => guardianService.getGuardiansForStudent(studentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

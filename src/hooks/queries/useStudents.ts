
import { useQuery } from '@tanstack/react-query';
import { studentProfileService } from '@/lib/services/student/StudentProfileService';

export function useStudents(parentId: string) {
  return useQuery({
    queryKey: ['students', parentId],
    queryFn: () => studentProfileService.getStudentsForGuardian(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests twice
  });
}

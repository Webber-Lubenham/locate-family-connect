
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/lib/services/studentService';

export function useStudents(parentId: string) {
  return useQuery({
    queryKey: ['students', parentId],
    queryFn: () => studentService.getStudentsForGuardian(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

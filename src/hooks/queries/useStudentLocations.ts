
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/lib/services/studentService';

export function useStudentLocations(studentId: string) {
  return useQuery({
    queryKey: ['studentLocations', studentId],
    queryFn: () => studentService.getStudentLocations(studentId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

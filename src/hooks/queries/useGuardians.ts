import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/lib/services/studentService';

export function useGuardians(studentId: string) {
  return useQuery({
    queryKey: ['guardians', studentId],
    queryFn: () => studentService.getGuardiansByStudent(studentId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
} 
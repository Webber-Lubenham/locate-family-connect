import { BaseService } from '../base/BaseService';
import { Student } from '@/types/auth';
import { studentRepository } from './StudentRepository';
import { extractUniqueStudentIds } from './utils/studentUtils';

/**
 * Service responsible for managing student profile data
 */
export class StudentProfileService extends BaseService {
  /**
   * Fetch students for the current guardian
   */
  async getStudentsForGuardian(): Promise<Student[]> {
    try {
      console.log('[StudentProfileService] Starting student fetch for guardian');
      // Get current user
      const user = await this.getCurrentUser();
      console.log('[StudentProfileService] Authenticated user:', user.id, user.email);
      // Buscar estudantes vinculados via função segura
      const { data, error } = await this.supabase.rpc('get_guardian_students');
      if (error) throw error;
      if (!data || data.length === 0) {
        return [];
      }
      // Converter para o tipo Student
      const students: Student[] = data.map((item: any) => ({
        id: item.student_id,
        name: item.student_name || '',
        email: item.student_email || '',
        created_at: '',
        status: 'active',
        avatar_url: null,
        phone: null,
      }));
      return students;
    } catch (error) {
      console.error('[StudentProfileService] Error fetching students:', error);
      this.showError('Não foi possível buscar os estudantes');
      return [];
    }
  }
  
  /**
   * Alias for getStudentsForGuardian to support hooks
   */
  async getStudentsByParent(): Promise<Student[]> {
    return this.getStudentsForGuardian();
  }
}

export const studentProfileService = new StudentProfileService();

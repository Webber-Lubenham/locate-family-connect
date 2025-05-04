
import { BaseService } from '../base/BaseService';
import { Student } from '@/types/database';

/**
 * Repository responsible for student data access
 */
export class StudentRepository extends BaseService {
  /**
   * Fetch students for a guardian
   */
  async fetchStudentsForGuardian(guardianId: string): Promise<Student[]> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .select('*')
        .eq('guardian_id', guardianId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Convert to correct type
      const students: Student[] = data.map(student => ({
        id: student.id,
        name: student.name || '',
        email: student.email || '',
        created_at: student.created_at || '',
        guardian_id: student.guardian_id || null,
        status: student.status || 'active',
        avatar_url: student.avatar_url || null,
        phone: student.phone || null,
      }));
      
      return students;
    } catch (error) {
      console.error('[StudentRepository] Error fetching students:', error);
      return [];
    }
  }
  
  /**
   * Fetch students by parent ID
   */
  async fetchStudentsByParent(parentId: string): Promise<Student[]> {
    try {
      // Currently mocked with static data - would need to implement actual DB query
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          created_at: new Date().toISOString(),
          status: 'active'
        },
        {
          id: '2',
          name: 'Maria Oliveira',
          email: 'maria@example.com',
          created_at: new Date().toISOString(),
          status: 'active'
        }
      ];
      
      return mockStudents;
    } catch (error) {
      console.error('[StudentRepository] Error fetching students by parent:', error);
      return [];
    }
  }
  
  /**
   * Add a student and link to a guardian
   */
  async addStudent(name: string, email: string, guardianId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('students')
        .insert({
          name: name,
          email: email,
          guardian_id: guardianId,
          status: 'active'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('[StudentRepository] Error adding student:', error);
      return false;
    }
  }
}

export const studentRepository = new StudentRepository();

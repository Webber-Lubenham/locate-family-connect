
import { BaseService } from '../base/BaseService';
import { Student } from '@/types/auth';
import { StudentRPCResponse, StudentRelationship } from './types';

/**
 * Repository responsible for student data access
 */
export class StudentRepository extends BaseService {
  /**
   * Find relationships by email
   */
  async findRelationshipsByEmail(email: string): Promise<StudentRelationship[]> {
    try {
      const { data, error } = await this.supabase
        .from('guardian_student_relationships')
        .select('student_id')
        .eq('guardian_email', email);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Explicitly cast data to StudentRelationship[] to avoid type recursion
      const relationships: StudentRelationship[] = [];
      for (const item of data) {
        relationships.push({
          student_id: item.student_id
        });
      }
      
      return relationships;
    } catch (error) {
      console.error('[StudentRepository] Error finding relationships by email:', error);
      return [];
    }
  }
  
  /**
   * Find relationships by ID
   */
  async findRelationshipsById(id: string): Promise<StudentRelationship[]> {
    try {
      const { data, error } = await this.supabase
        .from('parent_student_relationships')
        .select('student_id')
        .eq('parent_id', id);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Explicitly cast data to StudentRelationship[] to avoid type recursion
      const relationships: StudentRelationship[] = [];
      for (const item of data) {
        relationships.push({
          student_id: item.student_id
        });
      }
      
      return relationships;
    } catch (error) {
      console.error('[StudentRepository] Error finding relationships by ID:', error);
      return [];
    }
  }
  
  /**
   * Fetch student profiles
   */
  async fetchStudentProfiles(studentIds: string[]): Promise<Student[]> {
    try {
      if (!studentIds.length) return [];
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds);
      
      if (error) throw error;
      
      return data.map(profile => ({
        id: profile.user_id,
        name: profile.full_name,
        email: profile.email,
        type: 'student'
      }));
    } catch (error) {
      console.error('[StudentRepository] Error fetching student profiles:', error);
      return [];
    }
  }
  
  /**
   * Fetch students via RPC
   */
  async fetchStudentsViaRPC(email: string): Promise<Student[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_guardian_students', {
          guardian_email: email
        });
      
      if (error) throw error;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      // Map RPC response to Student type
      const students: Student[] = [];
      for (const item of data as StudentRPCResponse[]) {
        students.push({
          id: item.student_id,
          name: item.student_name || 'Unknown Student',
          email: item.student_email || 'No email',
          type: 'student'
        });
      }
      
      return students;
    } catch (error) {
      console.error('[StudentRepository] Error fetching students via RPC:', error);
      return [];
    }
  }
}

export const studentRepository = new StudentRepository();

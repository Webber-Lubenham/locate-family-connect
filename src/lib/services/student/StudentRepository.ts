
import { BaseService } from '../base/BaseService';
import { Student } from '@/types/auth';
import { StudentRelationship, StudentRPCResponse } from './types';

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
        .from('profiles')
        .select('*')
        .eq('user_type', 'student');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Convert to correct type
      const students: Student[] = data.map(student => ({
        id: student.id.toString(),
        name: student.full_name || '',
        email: student.email || '',
        created_at: student.created_at || '',
        status: 'active',
        avatar_url: null,
        phone: student.phone || null,
      }));
      
      return students;
    } catch (error) {
      console.error('[StudentRepository] Error fetching students:', error);
      return [];
    }
  }
  
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
      
      return data as StudentRelationship[];
    } catch (error) {
      console.error('[StudentRepository] Error finding relationships by email:', error);
      return [];
    }
  }
  
  /**
   * Find relationships by ID
   */
  async findRelationshipsById(userId: string): Promise<StudentRelationship[]> {
    try {
      const { data, error } = await this.supabase
        .from('parent_student_relationships')
        .select('student_id')
        .eq('parent_id', userId);
        
      if (error) throw error;
      
      return data as StudentRelationship[];
    } catch (error) {
      console.error('[StudentRepository] Error finding relationships by ID:', error);
      return [];
    }
  }
  
  /**
   * Fetch student profiles by IDs
   */
  async fetchStudentProfiles(studentIds: string[]): Promise<Student[]> {
    try {
      if (studentIds.length === 0) return [];
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds as any)
        .eq('user_type', 'student');
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Convert to Student type
      const students: Student[] = data.map(profile => ({
        id: profile.id.toString(),
        name: profile.full_name || '',
        email: profile.email || '',
        created_at: profile.created_at || '',
        status: 'active',
        avatar_url: null,
        phone: profile.phone || null,
      }));
      
      return students;
    } catch (error) {
      console.error('[StudentRepository] Error fetching student profiles:', error);
      return [];
    }
  }
  
  /**
   * Fetch students via RPC
   */
  async fetchStudentsViaRPC(guardianEmail: string): Promise<Student[]> {
    try {
      // Call RPC function or use a view to get student data
      const { data, error } = await this.supabase
        .rpc('get_guardian_students', { guardian_email: guardianEmail });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Convert RPC response to Student type
      const students: Student[] = (data as StudentRPCResponse[]).map(item => ({
        id: item.student_id.toString(), // Convert UUID to string
        name: item.student_name || '',
        email: item.student_email || '',
        created_at: item.relationship_date || '',
        status: 'active',
        avatar_url: null,
        phone: null,
      }));
      
      return students;
    } catch (error) {
      console.error('[StudentRepository] Error fetching students via RPC:', error);
      return [];
    }
  }
  
  /**
   * Add a student
   */
  async addStudent(name: string, email: string, guardianId: string): Promise<boolean> {
    try {
      // Create a profile for the student
      const { error } = await this.supabase
        .from('profiles')
        .insert({
          full_name: name,
          email: email,
          user_type: 'student',
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

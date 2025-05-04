
import { supabase } from '@/lib/supabase';
import { StudentRelationship, StudentRPCResponse } from './types';
import { Student } from '@/types/auth';

/**
 * Repository class for handling direct database interactions related to students
 */
export class StudentRepository {
  /**
   * Fetch relationships between students and guardians by guardian email
   */
  async findRelationshipsByEmail(email: string): Promise<StudentRelationship[]> {
    const { data, error } = await supabase
      .from('guardians')
      .select('student_id')
      .eq('email', email)
      .eq('is_active', true);
    
    if (error) {
      console.error('[StudentRepository] Error fetching relationships by email:', error);
    }
    
    const relationships: StudentRelationship[] = [];
    if (data && Array.isArray(data)) {
      for (const item of data) {
        relationships.push({
          student_id: item.student_id
        });
      }
    }
    
    return relationships;
  }
  
  /**
   * Fetch relationships between students and guardians by guardian ID
   */
  async findRelationshipsById(guardianId: string): Promise<StudentRelationship[]> {
    const { data, error } = await supabase
      .from('guardians')
      .select('student_id')
      .eq('guardian_id', guardianId)
      .eq('is_active', true);
    
    if (error) {
      console.error('[StudentRepository] Error fetching relationships by ID:', error);
    }
    
    const relationships: StudentRelationship[] = [];
    if (data && Array.isArray(data)) {
      for (const item of data) {
        relationships.push({
          student_id: item.student_id
        });
      }
    }
    
    return relationships;
  }
  
  /**
   * Fetch students via RPC function
   */
  async fetchStudentsViaRPC(email: string): Promise<Student[]> {
    console.log('[StudentRepository] Attempting RPC get_guardian_students');
    
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_guardian_students',
        { guardian_email: email }
      );
      
      if (rpcError) {
        console.error('[StudentRepository] RPC error:', rpcError);
        return [];
      }
      
      if (!rpcData || rpcData.length === 0) {
        return [];
      }
      
      console.log('[StudentRepository] Students found via RPC:', rpcData);
      
      return rpcData.map((item: StudentRPCResponse) => ({
        id: item.student_id,
        name: item.student_name || 'Nome não informado',
        email: item.student_email || 'Email não informado',
        created_at: item.relationship_date || new Date().toISOString()
      }));
    } catch (error) {
      console.error('[StudentRepository] RPC exception:', error);
      return [];
    }
  }
  
  /**
   * Fetch student profiles by their IDs
   */
  async fetchStudentProfiles(studentIds: string[]): Promise<Student[]> {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, created_at')
      .in('user_id', studentIds);
    
    if (error) {
      console.error('[StudentRepository] Error fetching profiles:', error);
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      return [];
    }
    
    return profiles.map(profile => ({
      id: profile.user_id || '',
      name: profile.full_name || 'Nome não informado',
      email: profile.email || 'Email não informado',
      created_at: profile.created_at || new Date().toISOString()
    }));
  }
}

export const studentRepository = new StudentRepository();

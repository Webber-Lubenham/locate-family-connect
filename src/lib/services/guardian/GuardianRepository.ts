
import { BaseService } from '../base/BaseService';
import { GuardianData } from '@/types/database';
import { GuardianDBResponse } from './types';

/**
 * Repository responsible for guardian data access
 */
export class GuardianRepository extends BaseService {
  /**
   * Fetch guardians for a student
   */
  async fetchGuardiansForStudent(studentId: string): Promise<GuardianDBResponse[]> {
    try {
      const { data, error } = await this.supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data as GuardianDBResponse[];
    } catch (error) {
      console.error('[GuardianRepository] Error fetching guardians:', error);
      return [];
    }
  }
  
  /**
   * Check if a guardian relationship already exists
   */
  async checkGuardianExists(studentId: string, email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId)
        .eq('email', email)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('[GuardianRepository] Error checking guardian exists:', error);
      return false;
    }
  }
  
  /**
   * Add a guardian for a student
   */
  async addGuardian(
    studentId: string, 
    email: string,
    fullName: string = 'Responsável',
    relationshipType: string | null = null,
    phone: string | null = null
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('guardians')
        .insert({
          student_id: studentId,
          email: email,
          full_name: fullName,
          relationship_type: relationshipType,
          is_active: true,
          phone: phone
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('[GuardianRepository] Error adding guardian:', error);
      throw error;
    }
  }
  
  /**
   * Delete a guardian by ID
   */
  async deleteGuardian(guardianId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('guardians')
        .delete()
        .eq('id', guardianId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('[GuardianRepository] Error deleting guardian:', error);
      throw error;
    }
  }
}

export const guardianRepository = new GuardianRepository();

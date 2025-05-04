
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
      
      // Get relationships by email
      const relationshipsByEmail = await studentRepository.findRelationshipsByEmail(user.email);
      console.log('[StudentProfileService] Relationships found by email:', relationshipsByEmail.length);
      
      // Get relationships by ID
      const relationshipsById = await studentRepository.findRelationshipsById(user.id);
      console.log('[StudentProfileService] Relationships found by ID:', relationshipsById.length);
      
      // Extract unique student IDs
      const uniqueStudentIds = extractUniqueStudentIds(relationshipsByEmail, relationshipsById);
      console.log('[StudentProfileService] Unique student IDs:', uniqueStudentIds);
      
      // If no relationships found, try RPC method
      if (uniqueStudentIds.length === 0) {
        return await studentRepository.fetchStudentsViaRPC(user.email);
      }
      
      // Fetch student profiles
      return await studentRepository.fetchStudentProfiles(uniqueStudentIds);
      
    } catch (error: any) {
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

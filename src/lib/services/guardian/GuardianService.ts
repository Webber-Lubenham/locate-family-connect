
import { BaseService } from '../base/BaseService';
import { GuardianData } from '@/types/database';
import { guardianRepository } from './GuardianRepository';
import { mapToGuardianData } from './utils/guardianUtils';
import { AddGuardianRequest, GuardianOperationResult } from './types';

/**
 * Service responsible for managing guardian relationships
 */
export class GuardianService extends BaseService {
  /**
   * Get guardians for a student
   */
  async getGuardiansForStudent(studentId: string): Promise<GuardianData[]> {
    try {
      // Check auth
      await this.getCurrentUser();
      
      // Get guardians from repository
      const guardiansData = await guardianRepository.fetchGuardiansForStudent(studentId);
      
      // Convert to GuardianData format
      return mapToGuardianData(guardiansData);
    } catch (error: any) {
      console.error('[GuardianService] Error fetching guardians:', error);
      this.showError('Não foi possível buscar os responsáveis');
      return [];
    }
  }
  
  /**
   * Add a guardian for a student
   */
  async addGuardian(studentId: string, email: string, relationshipType?: string): Promise<boolean> {
    try {
      // Check if guardian already exists
      const exists = await guardianRepository.checkGuardianExists(studentId, email);
      
      if (exists) {
        this.showSuccess('Este responsável já está registrado para este estudante');
        return false;
      }
      
      // Add guardian using repository
      await guardianRepository.addGuardian(
        studentId, 
        email, 
        'Responsável', 
        relationshipType || null
      );
      
      this.showSuccess('Responsável adicionado com sucesso');
      return true;
    } catch (error: any) {
      console.error('[GuardianService] Error adding guardian:', error);
      this.showError('Não foi possível adicionar o responsável');
      return false;
    }
  }
  
  /**
   * Alias for getGuardiansForStudent to support hooks
   */
  async getGuardiansByStudent(studentId: string): Promise<GuardianData[]> {
    return this.getGuardiansForStudent(studentId);
  }
}

export const guardianService = new GuardianService();

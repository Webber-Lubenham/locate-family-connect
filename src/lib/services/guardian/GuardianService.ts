
import { BaseService } from '../base/BaseService';
import { GuardianData } from '@/types/database';

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
      
      // Get guardians
      const { data, error } = await this.supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Map the returned data to match our GuardianData interface
      return data.map(item => ({
        id: item.id,
        student_id: item.student_id || null,
        guardian_id: null, // Not present in the database, default to null
        email: item.email,
        full_name: item.full_name || 'Nome não informado',
        phone: item.phone,
        is_active: !!item.is_active,
        created_at: item.created_at,
        relationship_type: null, // Not present in the database, default to null
        status: 'active' as const
      }));
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
      const { data: existing, error: checkError } = await this.supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId)
        .eq('email', email)
        .maybeSingle();
      
      if (checkError) throw checkError;
      if (existing) {
        this.showSuccess('Este responsável já está registrado para este estudante');
        return false;
      }
      
      // Add guardian
      const { error } = await this.supabase
        .from('guardians')
        .insert({
          student_id: studentId,
          email: email,
          full_name: 'Responsável',
          relationship_type: relationshipType || null,
          is_active: true
        });
      
      if (error) throw error;
      
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

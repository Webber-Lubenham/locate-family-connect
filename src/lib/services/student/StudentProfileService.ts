
import { BaseService } from '../base/BaseService';
import { Student } from '@/types/auth';

/**
 * Service responsible for managing student profile data
 */
export class StudentProfileService extends BaseService {
  /**
   * Fetch students for the current guardian
   */
  async getStudentsForGuardian(): Promise<Student[]> {
    try {
      console.log('[StudentProfileService] Iniciando busca de estudantes para o responsável');
      
      // Get current user
      const user = await this.getCurrentUser();
      console.log('[StudentProfileService] Usuário autenticado:', user.id, user.email);
      
      // First method: fetch relationships by email from guardians table
      const { data: guardianRelationshipsByEmail, error: emailError } = await this.supabase
        .from('guardians')
        .select('student_id')
        .eq('email', user.email)
        .eq('is_active', true);
      
      if (emailError) {
        console.error('[StudentProfileService] Erro ao buscar por email:', emailError);
      }
      
      // Create a type-safe array from the results
      const relationshipsByEmail: { student_id: string | null }[] = 
        Array.isArray(guardianRelationshipsByEmail) ? guardianRelationshipsByEmail : [];
      
      console.log('[StudentProfileService] Relacionamentos encontrados por email:', relationshipsByEmail.length);
      
      // Second method: fetch relationships by ID from guardians table
      const { data: guardianRelationshipsById, error: idError } = await this.supabase
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id)
        .eq('is_active', true);
      
      if (idError) {
        console.error('[StudentProfileService] Erro ao buscar por ID:', idError);
      }
      
      // Create a type-safe array from the results
      const relationshipsById: { student_id: string | null }[] = 
        Array.isArray(guardianRelationshipsById) ? guardianRelationshipsById : [];
      
      console.log('[StudentProfileService] Relacionamentos encontrados por ID:', relationshipsById.length);
      
      // Extract student IDs from email relationships
      const studentIdsFromEmail: string[] = [];
      for (const rel of relationshipsByEmail) {
        if (rel && rel.student_id) {
          studentIdsFromEmail.push(rel.student_id);
        }
      }
      
      // Extract student IDs from ID relationships
      const studentIdsFromId: string[] = [];
      for (const rel of relationshipsById) {
        if (rel && rel.student_id) {
          studentIdsFromId.push(rel.student_id);
        }
      }
      
      // Combine all IDs into a single array
      const allStudentIds: string[] = [];
      studentIdsFromEmail.forEach(id => allStudentIds.push(id));
      studentIdsFromId.forEach(id => allStudentIds.push(id));
      
      // Create unique IDs
      const uniqueStudentIds: string[] = [];
      const idSet = new Set<string>();
      
      for (const id of allStudentIds) {
        if (id && !idSet.has(id)) {
          idSet.add(id);
          uniqueStudentIds.push(id);
        }
      }
      
      console.log('[StudentProfileService] IDs de estudantes únicos:', uniqueStudentIds);
      
      if (uniqueStudentIds.length === 0) {
        return await this.fetchStudentsViaRPC(user.email);
      }
      
      return await this.fetchStudentProfiles(uniqueStudentIds);
      
    } catch (error: any) {
      console.error('[StudentProfileService] Erro ao buscar estudantes:', error);
      this.showError('Não foi possível buscar os estudantes');
      return [];
    }
  }
  
  /**
   * Alternative method to fetch students via RPC function
   */
  private async fetchStudentsViaRPC(email: string): Promise<Student[]> {
    console.log('[StudentProfileService] Tentando função get_guardian_students');
    
    try {
      const { data: rpcData, error: rpcError } = await this.supabase.rpc(
        'get_guardian_students',
        { guardian_email: email }
      );
      
      if (rpcError) {
        console.error('[StudentProfileService] Erro ao chamar RPC:', rpcError);
        return [];
      }
      
      if (rpcData && rpcData.length > 0) {
        console.log('[StudentProfileService] Estudantes encontrados via RPC:', rpcData);
        
        const students: Student[] = [];
        for (const item of rpcData) {
          students.push({
            id: item.student_id,
            name: item.student_name || 'Nome não informado',
            email: item.student_email || 'Email não informado',
            created_at: item.relationship_date || new Date().toISOString()
          });
        }
        return students;
      }
      
      return [];
    } catch (rpcEx) {
      console.error('[StudentProfileService] Exceção ao chamar RPC:', rpcEx);
      return [];
    }
  }
  
  /**
   * Fetch student profiles by their IDs
   */
  private async fetchStudentProfiles(studentIds: string[]): Promise<Student[]> {
    // Buscar perfis dos estudantes
    const { data: profiles, error: studentsError } = await this.supabase
      .from('profiles')
      .select('user_id, full_name, email, created_at')
      .in('user_id', studentIds);
    
    if (studentsError) {
      console.error('[StudentProfileService] Erro ao buscar perfis:', studentsError);
      throw studentsError;
    }
    
    console.log('[StudentProfileService] Perfis encontrados:', profiles?.length);
    
    if (!profiles || profiles.length === 0) {
      return [];
    }
    
    const formattedStudents: Student[] = [];
    for (const profile of profiles) {
      formattedStudents.push({
        id: profile.user_id || '',
        name: profile.full_name || 'Nome não informado',
        email: profile.email || 'Email não informado',
        created_at: profile.created_at || new Date().toISOString()
      });
    }
    
    console.log('[StudentProfileService] Estudantes formatados:', formattedStudents);
    
    return formattedStudents;
  }
  
  /**
   * Alias for getStudentsForGuardian to support hooks
   */
  async getStudentsByParent(): Promise<Student[]> {
    return this.getStudentsForGuardian();
  }
}

export const studentProfileService = new StudentProfileService();

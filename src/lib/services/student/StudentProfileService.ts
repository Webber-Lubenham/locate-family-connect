
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
      
      // Define explicit types for student relationships arrays
      interface StudentRelationship {
        student_id: string | null;
      }
      
      // First method: fetch relationships by email from guardians table
      const { data: emailData, error: emailError } = await this.supabase
        .from('guardians')
        .select('student_id')
        .eq('email', user.email)
        .eq('is_active', true);
      
      if (emailError) {
        console.error('[StudentProfileService] Erro ao buscar por email:', emailError);
      }
      
      // Handle data safely with explicit initialization and type assertion
      const relationshipsByEmail: StudentRelationship[] = [];
      if (Array.isArray(emailData)) {
        // Use spread to add items from emailData with proper type assertion
        relationshipsByEmail.push(...(emailData as StudentRelationship[]));
      }
      
      console.log('[StudentProfileService] Relacionamentos encontrados por email:', relationshipsByEmail.length);
      
      // Second method: fetch relationships by ID from guardians table
      const { data: idData, error: idError } = await this.supabase
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id)
        .eq('is_active', true);
      
      if (idError) {
        console.error('[StudentProfileService] Erro ao buscar por ID:', idError);
      }
      
      // Handle data safely with explicit initialization and type assertion
      const relationshipsById: StudentRelationship[] = [];
      if (Array.isArray(idData)) {
        // Use spread to add items from idData with proper type assertion
        relationshipsById.push(...(idData as StudentRelationship[]));
      }
      
      console.log('[StudentProfileService] Relacionamentos encontrados por ID:', relationshipsById.length);
      
      // Extract student IDs from relationships
      const allStudentIds: string[] = [];
      
      for (const rel of relationshipsByEmail) {
        if (rel && rel.student_id) {
          allStudentIds.push(rel.student_id);
        }
      }
      
      for (const rel of relationshipsById) {
        if (rel && rel.student_id) {
          allStudentIds.push(rel.student_id);
        }
      }
      
      // Create unique IDs using a Set
      const idSet = new Set<string>();
      const uniqueStudentIds: string[] = [];
      
      for (const id of allStudentIds) {
        if (!idSet.has(id)) {
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

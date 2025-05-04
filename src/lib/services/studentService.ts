import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Student } from '@/types/auth';
import { GuardianData, LocationData } from '@/types/database';

class StudentService {
  /**
   * Fetch students for the current guardian
   */
  async getStudentsForGuardian(): Promise<Student[]> {
    try {
      console.log('[studentService] Iniciando busca de estudantes para o responsável');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[studentService] Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('[studentService] Usuário autenticado:', user.id, user.email);
      
      // Primeiro método: buscar relacionamentos pela tabela guardians usando email
      const { data: relationshipsByEmail, error: emailError } = await supabase
        .from('guardians')
        .select('student_id')
        .eq('email', user.email)
        .eq('is_active', true);
      
      if (emailError) {
        console.error('[studentService] Erro ao buscar por email:', emailError);
      }
      
      console.log('[studentService] Relacionamentos encontrados por email:', relationshipsByEmail?.length);
      
      // Segundo método: buscar relacionamentos pela tabela guardians usando ID
      const { data: relationshipsById, error: idError } = await supabase
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id)
        .eq('is_active', true);
      
      if (idError) {
        console.error('[studentService] Erro ao buscar por ID:', idError);
      }
      
      console.log('[studentService] Relacionamentos encontrados por ID:', relationshipsById?.length);
      
      // Explicitly define types to fix excessive type instantiation issue
      const studentIdsFromEmail: string[] = relationshipsByEmail ? relationshipsByEmail.map(r => r.student_id) : [];
      const studentIdsFromId: string[] = relationshipsById ? relationshipsById.map(r => r.student_id) : [];
      
      // Combine student IDs from both sources and remove duplicates
      const allStudentIds = [...studentIdsFromEmail, ...studentIdsFromId];
      const uniqueStudentIds = Array.from(new Set(allStudentIds)).filter(Boolean);
      
      console.log('[studentService] IDs de estudantes únicos:', uniqueStudentIds);
      
      if (uniqueStudentIds.length === 0) {
        console.log('[studentService] Nenhum estudante encontrado para este responsável');
        
        // Tentar método alternativo usando função RPC
        try {
          console.log('[studentService] Tentando função get_guardian_students');
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_guardian_students',
            { guardian_email: user.email }
          );
          
          if (rpcError) {
            console.error('[studentService] Erro ao chamar RPC:', rpcError);
          } else if (rpcData && rpcData.length > 0) {
            console.log('[studentService] Estudantes encontrados via RPC:', rpcData);
            
            // Formatar dados de RPC para Student - sem usar map
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
        } catch (rpcEx) {
          console.error('[studentService] Exceção ao chamar RPC:', rpcEx);
        }
        
        return [];
      }
      
      // Buscar perfis dos estudantes
      const { data: profiles, error: studentsError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, created_at')
        .in('user_id', uniqueStudentIds);
      
      if (studentsError) {
        console.error('[studentService] Erro ao buscar perfis:', studentsError);
        throw studentsError;
      }
      
      console.log('[studentService] Perfis encontrados:', profiles?.length);
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // Formatar dados como objetos Student - sem usar map
      const formattedStudents: Student[] = [];
      for (const profile of profiles) {
        formattedStudents.push({
          id: profile.user_id || '',
          name: profile.full_name || 'Nome não informado',
          email: profile.email || 'Email não informado',
          created_at: profile.created_at || new Date().toISOString()
        });
      }
      
      console.log('[studentService] Estudantes formatados:', formattedStudents);
      
      return formattedStudents;
    } catch (error: any) {
      console.error('[studentService] Erro ao buscar estudantes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar os estudantes',
        variant: 'destructive'
      });
      return [];
    }
  }
  
  /**
   * Get guardians for a student
   */
  async getGuardiansForStudent(studentId: string): Promise<GuardianData[]> {
    try {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Get guardians
      const { data, error } = await supabase
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
      console.error('Error fetching guardians:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar os responsáveis',
        variant: 'destructive'
      });
      return [];
    }
  }

  /**
   * Alias for getStudentsForGuardian to support hooks
   */
  async getStudentsByParent(): Promise<Student[]> {
    return this.getStudentsForGuardian();
  }
  
  /**
   * Alias for getGuardiansForStudent to support hooks
   */
  async getGuardiansByStudent(studentId: string): Promise<GuardianData[]> {
    return this.getGuardiansForStudent(studentId);
  }
  
  /**
   * Get student locations
   */
  async getStudentLocations(studentId: string): Promise<LocationData[]> {
    try {
      // Get locations
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', studentId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching student locations:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar as localizações',
        variant: 'destructive'
      });
      return [];
    }
  }
  
  /**
   * Add a guardian for a student
   */
  async addGuardian(studentId: string, email: string, relationshipType?: string): Promise<boolean> {
    try {
      // Check if guardian already exists
      const { data: existing, error: checkError } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId)
        .eq('email', email)
        .maybeSingle();
      
      if (checkError) throw checkError;
      if (existing) {
        toast({
          title: 'Aviso',
          description: 'Este responsável já está registrado para este estudante',
        });
        return false;
      }
      
      // Add guardian
      const { error } = await supabase
        .from('guardians')
        .insert({
          student_id: studentId,
          email: email,
          full_name: 'Responsável',
          relationship_type: relationshipType || null,
          is_active: true
        });
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Responsável adicionado com sucesso',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding guardian:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o responsável',
        variant: 'destructive'
      });
      return false;
    }
  }
}

export const studentService = new StudentService();


import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { GuardianData, Student } from '@/types/auth';
import { LocationData } from '@/types/database';

class StudentService {
  /**
   * Fetch students for the current guardian
   */
  async getStudentsForGuardian(): Promise<Student[]> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Get guardian relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('guardians')
        .select('student_id')
        .eq('guardian_id', user.id)
        .eq('is_active', true);
      
      if (relationshipsError) throw relationshipsError;
      if (!relationships || relationships.length === 0) return [];
      
      // Extract student IDs
      const studentIds = relationships.map(r => r.student_id);
      
      // Get student profiles
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentIds);
      
      if (studentsError) throw studentsError;
      if (!students || students.length === 0) return [];
      
      // Format student data
      return students.map(student => ({
        id: student.user_id || '',
        name: student.full_name || 'Nome não informado',
        email: student.email || 'Email não informado',
        created_at: student.created_at || new Date().toISOString()
      }));
    } catch (error: any) {
      console.error('Error fetching students:', error);
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
        student_id: item.student_id || '',
        guardian_id: item.guardian_id || null,
        email: item.email,
        full_name: item.full_name,
        phone: item.phone,
        is_active: !!item.is_active,
        created_at: item.created_at,
        relationship_type: item.relationship_type || null,
        status: 'active'
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

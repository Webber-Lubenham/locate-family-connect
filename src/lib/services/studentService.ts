
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: 'active' | 'pending' | 'inactive';
}

export interface GuardianData {
  id: string;
  student_id: string;
  guardian_id: string | null;
  guardian_email: string;
  student_name?: string;
  relationship_type?: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

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
        .eq('status', 'active');
      
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
        id: student.user_id,
        name: student.full_name || 'Nome não informado',
        email: student.email || 'Email não informado',
        phone: student.phone || undefined,
        status: 'active'
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
      return data || [];
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
   * Add a guardian for a student
   */
  async addGuardian(studentId: string, email: string, relationshipType?: string): Promise<boolean> {
    try {
      // Check if guardian already exists
      const { data: existing, error: checkError } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId)
        .eq('guardian_email', email)
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
          guardian_email: email,
          relationship_type: relationshipType || 'Responsável',
          status: 'pending'
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

import { supabase } from '../supabase';
import type { Database } from '@/types/supabase';

interface AddStudentData {
  studentEmail: string;
  studentName: string;
  parentId: string;
}

interface UpdateStudentData {
  studentId: string;
  name: string;
  email: string;
}

interface Student {
  student_id: string;
  status: string;
  user_profiles: {
    name: string;
    email: string;
  };
}

interface LocationData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

interface UserProfile {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone?: string;
  user_type: 'student' | 'parent' | 'teacher';
  created_at: string;
  updated_at: string;
}

export const studentService = {
  async addStudent(data: AddStudentData) {
    const { studentEmail, studentName, parentId } = data;

    const { data: result, error } = await supabase.client.functions.invoke('invite-student', {
      body: { studentEmail, studentName, parentId }
    });

    if (error) {
      throw new Error(error.message);
    }

    return result;
  },

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    try {
      // Get the parent's profile first
      const { data: parentProfile, error: parentError } = await supabase.client
        .from('profiles')
        .select('email, user_id')
        .eq('user_id', parentId)
        .single();

      if (parentError) {
        console.error('Error fetching parent profile:', parentError);
        throw new Error(`Erro ao buscar perfil do responsável: ${parentError.message}`);
      }

      if (!parentProfile) {
        console.error('Parent profile not found for ID:', parentId);
        throw new Error('Perfil do responsável não encontrado');
      }

      // If profile email is empty, get the email from current session
      let guardianEmail = parentProfile.email;
      if (!guardianEmail) {
        const { data: { session }, error: sessionError } = await supabase.client.auth.getSession();
        if (sessionError || !session?.user?.email) {
          console.error('Error getting session:', sessionError);
          throw new Error('Email do responsável não encontrado');
        }
        guardianEmail = session.user.email;
        
        // Update the profile with the email
        const { error: updateError } = await supabase.client
          .from('profiles')
          .update({ email: guardianEmail })
          .eq('user_id', parentId);
          
        if (updateError) {
          console.error('Error updating profile email:', updateError);
        }
      }

      // Use the RPC function to get students
      const { data, error } = await supabase.client
        .rpc('get_guardian_students', {
          guardian_email: guardianEmail
        });

      if (error) {
        console.error('Error fetching students:', error);
        throw new Error(`Erro ao buscar estudantes: ${error.message}`);
      }

      // Transform the data to match the Student interface
      const transformedData: Student[] = (data || []).map(item => ({
        student_id: item.student_id,
        status: item.is_active ? 'active' : 'inactive',
        user_profiles: {
          name: item.student_name || 'Estudante',
          email: item.student_email || ''
        }
      }));

      return transformedData;
    } catch (error: any) {
      console.error('Error in getStudentsByParent:', error);
      throw new Error(error.message || 'Erro ao buscar estudantes');
    }
  },

  async getStudentLocations(studentId: string): Promise<LocationData[]> {
    const { data, error } = await supabase.client
      .from('locations')
      .select('*')
      .eq('user_id', studentId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error('Erro ao buscar localizações do estudante');
    }

    return data || [];
  },

  async updateStudent(data: UpdateStudentData) {
    const { studentId, name, email } = data;

    // Update the user profile
    const { error } = await supabase.client
      .from('profiles')
      .update({ 
        full_name: name,
        email: email 
      })
      .eq('user_id', studentId);

    if (error) {
      console.error('Error updating student:', error);
      throw new Error('Erro ao atualizar informações do estudante');
    }

    return true;
  },

  async deleteStudent(studentId: string) {
    // Delete the relationship first
    const { error: relationshipError } = await supabase.client
      .from('guardians')
      .delete()
      .eq('student_id', studentId);

    if (relationshipError) {
      console.error('Error deleting relationship:', relationshipError);
      throw new Error('Erro ao remover vínculo com o estudante');
    }

    // Then update the student's profile to inactive
    const { error: profileError } = await supabase.client
      .from('profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId);

    if (profileError) {
      console.error('Error updating student profile:', profileError);
      throw new Error('Erro ao desativar perfil do estudante');
    }

    return true;
  }
}; 
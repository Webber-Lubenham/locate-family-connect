
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { StudentFormValues } from '../types/student-form.types';

export const useInviteStudent = (onStudentAdded?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleInviteStudent = async (data: StudentFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Check if student already exists
      const { data: existingStudents, error: checkError } = await supabase
        .from('profiles')
        .select('id, user_id, email')
        .eq('email', data.email);

      if (checkError) throw checkError;

      let studentId = '';

      if (existingStudents && existingStudents.length > 0) {
        // Student exists, get their ID
        studentId = existingStudents[0].user_id || String(existingStudents[0].id);

        // Check if relationship already exists
        const { data: existingRelation, error: relationError } = await supabase
          .from('guardians')
          .select('id')
          .eq('student_id', studentId)
          .eq('guardian_id', user.id);

        if (relationError) throw relationError;

        if (existingRelation && existingRelation.length > 0) {
          toast({
            title: "Aviso",
            description: "Este estudante já está vinculado à sua conta.",
          });
          setIsLoading(false);
          return { success: false };
        }
      } else {
        // Student doesn't exist, inform user
        toast({
          title: "Estudante não encontrado",
          description: "Este email não está registrado como estudante. Por favor, peça ao estudante que se cadastre primeiro.",
          variant: "destructive"
        });
        setIsLoading(false);
        return { success: false };
      }

      // Create relationship
      const { error: addError } = await supabase
        .from('guardians')
        .insert({
          student_id: studentId,
          guardian_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "Responsável",
          is_active: true
        });

      if (addError) throw addError;

      setSuccess(true);
      toast({
        title: "Estudante adicionado",
        description: `${data.name} foi vinculado à sua conta com sucesso.`,
      });

      if (onStudentAdded) {
        onStudentAdded();
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao adicionar estudante:", error);
      setError(error.message || "Não foi possível adicionar o estudante.");
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o estudante.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    success,
    handleInviteStudent,
    setError,
    setSuccess
  };
};

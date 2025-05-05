
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

// Define explicit interface for the hook's return value
interface InviteStudentResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export const useInviteStudent = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  /**
   * Handles the invitation of a student by email
   */
  const handleInviteStudent = async (
    email: string,
    name: string,
    phone?: string,
    additionalData?: Record<string, any>
  ): Promise<InviteStudentResult> => {
    setLoading(true);
    
    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setLoading(false);
        toast({
          title: 'Erro',
          description: 'Email inválido',
          variant: 'destructive',
        });
        return { 
          success: false, 
          error: 'Email inválido' 
        };
      }
      
      // Check if student already exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();
      
      if (userCheckError && userCheckError.code !== 'PGRST116') {
        console.error('Error checking if student exists:', userCheckError);
        setLoading(false);
        toast({
          title: 'Erro',
          description: 'Erro ao verificar se o aluno já existe',
          variant: 'destructive',
        });
        return { 
          success: false, 
          error: 'Erro ao verificar se o aluno já existe' 
        };
      }
      
      if (existingUser) {
        setLoading(false);
        toast({
          title: 'Erro',
          description: 'Um usuário com este email já existe',
          variant: 'destructive',
        });
        return { 
          success: false, 
          error: 'Um usuário com este email já existe' 
        };
      }
      
      // Create invitation
      const invitation = {
        email,
        name,
        phone: phone || null,
        ...additionalData
      };
      
      // Call the function
      const { data: inviteData, error: inviteError } = await supabase.functions.invoke(
        'invite-student',
        {
          body: invitation
        }
      );
      
      if (inviteError) {
        console.error('Error inviting student:', inviteError);
        setLoading(false);
        toast({
          title: 'Erro',
          description: 'Não foi possível enviar o convite',
          variant: 'destructive',
        });
        return { 
          success: false, 
          error: inviteError.message || 'Erro ao enviar convite' 
        };
      }
      
      // Success!
      setLoading(false);
      toast({
        title: 'Sucesso',
        description: 'Convite enviado com sucesso',
      });
      
      return {
        success: true,
        message: 'Convite enviado com sucesso',
        data: inviteData
      };
    } catch (error: any) {
      console.error('Error in handleInviteStudent:', error);
      setLoading(false);
      
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao enviar o convite',
        variant: 'destructive',
      });
      
      return {
        success: false,
        error: error.message || 'Ocorreu um erro ao enviar o convite'
      };
    }
  };
  
  return {
    loading,
    handleInviteStudent
  };
};

export default useInviteStudent;

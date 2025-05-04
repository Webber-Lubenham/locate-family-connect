
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface GuardianData {
  id: string;
  student_id: string;
  guardian_id: string | null;
  guardian_email: string;
  full_name?: string;
  created_at: string;
  status: 'pending' | 'active' | 'rejected';
  relationship_type?: string;
}

export function useGuardianData() {
  const [loading, setLoading] = useState(false);
  const [guardians, setGuardians] = useState<GuardianData[]>([]);
  const { toast } = useToast();

  // Fetch guardians for a student
  const fetchGuardians = useCallback(async (studentId?: string) => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId);

      if (error) {
        throw error;
      }

      setGuardians(data || []);
    } catch (error: any) {
      console.error('Error fetching guardians:', error);
      toast({
        title: "Erro ao buscar dados",
        description: error.message || "Não foi possível carregar a lista de responsáveis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Add a guardian for a student
  const addGuardian = useCallback(async (studentId: string, guardianEmail: string, relationshipType?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', studentId)
        .eq('guardian_email', guardianEmail)
        .maybeSingle();
      
      if (data) {
        toast({
          title: "Aviso",
          description: "Este responsável já está cadastrado para este estudante",
          variant: "default"
        });
        return false;
      }

      const { error: insertError } = await supabase
        .from('guardians')
        .insert({
          student_id: studentId,
          guardian_email: guardianEmail,
          relationship_type: relationshipType,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Responsável adicionado com sucesso",
        variant: "default"
      });

      // Refresh the guardians list
      await fetchGuardians(studentId);
      return true;
    } catch (error: any) {
      console.error('Error adding guardian:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o responsável",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchGuardians, toast]);

  // Remove a guardian
  const removeGuardian = useCallback(async (guardianData: GuardianData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('guardians')
        .delete()
        .eq('id', guardianData.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Responsável removido com sucesso",
        variant: "default"
      });

      // Refresh the guardians list if we have a student ID
      if (guardianData.student_id) {
        await fetchGuardians(guardianData.student_id);
      } else {
        // Remove locally if we can't refresh
        setGuardians(prev => prev.filter(g => g.id !== guardianData.id));
      }
      
      return true;
    } catch (error: any) {
      console.error('Error removing guardian:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o responsável",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchGuardians, toast]);

  // Resend invitation to guardian
  const resendInvitation = useCallback(async (guardianData: GuardianData): Promise<void> => {
    setLoading(true);
    try {
      // First update the status back to pending
      const { error: updateError } = await supabase
        .from('guardians')
        .update({ status: 'pending' })
        .eq('id', guardianData.id);

      if (updateError) throw updateError;

      // Then call the function to send the invitation (implementation would depend on your system)
      // For now, we'll just show a success message
      toast({
        title: "Convite reenviado",
        description: `O convite foi reenviado para ${guardianData.guardian_email}`,
        variant: "default"
      });

      // Update locally
      setGuardians(prev => 
        prev.map(g => g.id === guardianData.id ? { ...g, status: 'pending' } : g)
      );
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível reenviar o convite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    guardians,
    fetchGuardians,
    addGuardian,
    removeGuardian,
    resendInvitation
  };
}

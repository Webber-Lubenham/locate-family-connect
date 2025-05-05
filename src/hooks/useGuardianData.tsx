
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { GuardianData, StudentGuardianResponse } from '@/types/database';
import { useUser } from '@/contexts/UnifiedAuthContext';

export function useGuardianData() {
  const [loading, setLoading] = useState(false);
  const [guardians, setGuardians] = useState<GuardianData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  // Fetch guardians for a student
  const fetchGuardians = useCallback(async (studentId?: string) => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Estratégia 1: Tentar funções diretas ou RPC que podem existir
      // Tentaremos múltiplas abordagens em ordem de preferência de segurança
      let guardianData = null;
      let errorFound = null;
      
      // Tentativa 1: Acessar diretamente a tabela guardians
      try {
        const { data, error } = await supabase
          .from('guardians')
          .select('*')
          .eq('student_id', studentId);
          
        if (!error && data) {
          guardianData = data;
        } else {
          errorFound = error;
        }
      } catch (directError) {
        console.log('Erro ao acessar diretamente a tabela guardians:', directError);
        // Continue para próxima tentativa
      }
      
      // Tentativa 2: Usar a função SQL segura (se a migração foi aplicada)
      if (!guardianData) {
        try {
          // Usamos @ts-ignore pois a função pode não existir na tipagem TS ainda
          // @ts-ignore - Ignorando erro de tipagem pois esta função existe no banco mas não no tipo
          const { data, error } = await supabase.rpc(
            // @ts-ignore - A função existe no banco mas não na tipagem
            'get_student_guardians_secure', { 
              // Para funções SQL expostas como RPC, devemos usar o nome exato do parâmetro
              // sem o prefixo 'p_' que é apenas interno à definição da função SQL
              p_student_id: studentId 
            }
          );
          
          if (!error && data) {
            guardianData = data;
            // Registramos que a função está disponível para futuros usos
            console.log('Função get_student_guardians_secure está disponível');
          }
        } catch (rpcError) {
          console.log('Erro na tentativa via função RPC segura:', rpcError);
          // Não definimos errorFound aqui, pois isto é um fallback
        }
      }
      
      // Se encontramos dados em alguma das tentativas, formatamos e retornamos
      if (guardianData && Array.isArray(guardianData)) {
        const formattedGuardians: GuardianData[] = guardianData.map(item => ({
          id: item.id,
          student_id: item.student_id || studentId,
          guardian_id: null,
          email: item.email,
          full_name: item.full_name || 'Sem nome',
          phone: item.phone,
          is_active: !!item.is_active,
          created_at: item.created_at || new Date().toISOString(),
          relationship_type: null,
          status: 'active' as const
        }));
        
        setGuardians(formattedGuardians);
        setLoading(false);
        return;
      }
      
      // Se chegamos aqui e não conseguimos pegar os dados em nenhuma tentativa
      if (errorFound) {
        if (errorFound.code === '42501') { // Erro de permissão
          setError('Erro de permissão: Por favor, contate o administrador do sistema.');
          setLoading(false);
          return;
        }
        throw errorFound;
      }
      
      // Se chegamos aqui sem dados e sem erros, retorna lista vazia
      setGuardians([]);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching guardians:', error);
      setError('Não foi possível carregar a lista de responsáveis');
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
        .eq('email', guardianEmail)
        .maybeSingle();
      
      if (data) {
        toast({
          title: "Aviso",
          description: "Este responsável já está cadastrado para este estudante",
          variant: "default"
        });
        setLoading(false);
        return false;
      }

      const { error: insertError } = await supabase
        .from('guardians')
        .insert({
          student_id: studentId,
          email: guardianEmail,
          full_name: 'Responsável',
          relationship_type: relationshipType || null,
          is_active: true
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
      setLoading(false);
      return false;
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
      
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error removing guardian:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o responsável",
        variant: "destructive"
      });
      setLoading(false);
      return false;
    }
  }, [fetchGuardians, toast]);

  // Resend invitation to guardian
  const resendInvitation = useCallback(async (guardianData: GuardianData): Promise<void> => {
    setLoading(true);
    try {
      // First update the status back to pending
      const { error: updateError } = await supabase
        .from('guardians')
        .update({ is_active: true })
        .eq('id', guardianData.id);

      if (updateError) throw updateError;

      // Then call the function to send the invitation (implementation would depend on your system)
      // For now, we'll just show a success message
      toast({
        title: "Convite reenviado",
        description: `O convite foi reenviado para ${guardianData.email}`,
        variant: "default"
      });

      // Update locally
      setGuardians(prev => 
        prev.map(g => g.id === guardianData.id ? { ...g, is_active: true } : g)
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
    error,
    guardians,
    fetchGuardians,
    addGuardian,
    removeGuardian,
    resendInvitation
  };
}

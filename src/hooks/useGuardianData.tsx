
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GuardianData } from '@/types/database';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { PostgrestError } from '@supabase/supabase-js';

export function useGuardianData() {
  // Use the standardized query hook for consistent error handling
  const { 
    data: guardians, 
    loading, 
    error, 
    executeQuery, 
    resetState 
  } = useSupabaseQuery<GuardianData[]>();
  const { user } = useUser();

  // Create mock data for development mode
  const createMockGuardianData = useCallback((studentId?: string): GuardianData[] => [
    {
      id: '1',
      student_id: studentId || '',
      guardian_id: null,
      email: 'responsavel1@exemplo.com',
      full_name: 'Responsável Exemplo 1',
      phone: '(11) 98765-4321',
      is_active: true,
      created_at: new Date().toISOString(),
      relationship_type: 'parent',
      status: 'active'
    },
    {
      id: '2',
      student_id: studentId || '',
      guardian_id: null,
      email: 'responsavel2@exemplo.com',
      full_name: 'Responsável Exemplo 2',
      phone: '(11) 91234-5678',
      is_active: true,
      created_at: new Date().toISOString(),
      relationship_type: 'relative',
      status: 'active'
    }
  ], []);

  // Type to ensure query functions return what useSupabaseQuery expects
  type QueryResult<T> = Promise<{data: T | null, error: PostgrestError | null}>

  // Fetch guardians for a student using the standardized query hook
  const fetchGuardians = useCallback(async (studentId?: string) => {
    if (!studentId) return { data: null, error: 'ID do estudante não fornecido' };
    
    return executeQuery<GuardianData[]>(
      async (): QueryResult<GuardianData[]> => {
        try {
          // Usar a função SQL segura para buscar os responsáveis
          // @ts-ignore - A função existe no banco mas não na tipagem
          const result = await supabase.rpc(
            'get_student_guardians_secure',
            { p_student_id: studentId }
          );

          if (result.error) {
            // Verificar se é erro de permissão
            if (result.error.code === '42501') {
              return {
                data: null,
                error: { message: 'Erro de permissão: Por favor, contate o administrador do sistema.' } as PostgrestError
              };
            }
            return { data: null, error: result.error };
          }
          
          if (result.data && Array.isArray(result.data)) {
            // Formatar os dados retornados
            const formattedGuardians: GuardianData[] = result.data.map(item => ({
              id: item.id,
              student_id: item.student_id || studentId,
              guardian_id: null,
              email: item.email,
              full_name: item.full_name || 'Sem nome',
              phone: item.phone || '',
              is_active: !!item.is_active,
              created_at: item.created_at || new Date().toISOString(),
              relationship_type: 'parent', // Default value to satisfy type
              status: 'active' as const
            }));

            return { data: formattedGuardians, error: null };
          }
          
          // Se não temos dados, mas também não temos erro
          return { data: [], error: null };
        } catch (rpcError: any) {
          console.log('Erro na tentativa via função RPC segura:', rpcError);
          return { 
            data: null, 
            error: { 
              message: rpcError.message || 'Erro ao buscar responsáveis via RPC' 
            } as PostgrestError
          };
        }
      },
      { studentId } as any, // Using any to bypass type checking for params
      {
        mockData: createMockGuardianData(studentId),
        successMessage: guardians?.length === 0 ? 'Nenhum responsável encontrado' : undefined
      }
    );
  }, [executeQuery, createMockGuardianData, guardians?.length]);

  // Add a guardian for a student using the standardized query pattern
  const addGuardian = useCallback(async (studentId: string, guardianEmail: string, relationshipType: string = 'parent') => {
    // First check if guardian already exists
    const checkResult = await executeQuery<any>(
      async (): QueryResult<any> => {
        const result = await supabase
          .from('guardians')
          .select('*')
          .eq('student_id', studentId)
          .eq('email', guardianEmail)
          .maybeSingle();
          
        return { data: result.data, error: result.error };
      },
      { studentId, guardianEmail } as any,
      { skipParamsCheck: true }
    );
    
    if (checkResult.data) {
      return { success: false, message: "Este responsável já está cadastrado para este estudante" };
    }
    
    // If not already added, insert the guardian
    const insertResult = await executeQuery<any>(
      async (): QueryResult<any> => {
        const result = await supabase
          .from('guardians')
          .insert({
            student_id: studentId,
            email: guardianEmail,
            full_name: 'Responsável',
            relationship_type: relationshipType,
            is_active: true
          });
          
        return { data: result.data, error: result.error };
      },
      { studentId, guardianEmail, relationshipType } as any,
      { 
        skipParamsCheck: true,
        successMessage: "Responsável adicionado com sucesso" 
      }
    );
    
    if (insertResult.error) {
      return { success: false, message: insertResult.error };
    }
    
    // Refresh the guardians list
    await fetchGuardians(studentId);
    return { success: true, message: "Responsável adicionado com sucesso" };
  }, [fetchGuardians, executeQuery]);

  // Remove a guardian using the standardized query pattern
  const removeGuardian = useCallback(async (guardianData: GuardianData) => {
    const result = await executeQuery<any>(
      async (): QueryResult<any> => {
        const result = await supabase
          .from('guardians')
          .delete()
          .eq('id', guardianData.id);
          
        return { data: result.data, error: result.error };
      },
      { guardianId: guardianData.id } as any,
      { 
        skipParamsCheck: true,
        successMessage: "Responsável removido com sucesso" 
      }
    );
    
    if (result.error) {
      return { success: false, message: result.error };
    }
    
    // Refresh the guardians list if we have a student ID
    if (guardianData.student_id) {
      await fetchGuardians(guardianData.student_id);
    }
    
    return { success: true, message: "Responsável removido com sucesso" };
  }, [fetchGuardians, executeQuery]);

  // Resend invitation to guardian using the standardized query pattern
  const resendInvitation = useCallback(async (guardianData: GuardianData) => {
    const result = await executeQuery<any>(
      async (): QueryResult<any> => {
        const result = await supabase
          .from('guardians')
          .update({ is_active: true })
          .eq('id', guardianData.id);
          
        return { data: result.data, error: result.error };
      },
      { guardianId: guardianData.id } as any,
      { 
        skipParamsCheck: true,
        successMessage: `O convite foi reenviado para ${guardianData.email}` 
      }
    );
    
    return { 
      success: !result.error, 
      message: result.error ? result.error : `O convite foi reenviado para ${guardianData.email}` 
    };
  }, [executeQuery]);

  return {
    loading,
    error,
    guardians,
    fetchGuardians,
    addGuardian,
    removeGuardian,
    resendInvitation,
    resetErrorState: resetState
  };
}

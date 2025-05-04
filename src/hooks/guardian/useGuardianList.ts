
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useUser } from '@/contexts/UnifiedAuthContext';
import { Guardian } from './types';
import { useLocationSharing } from './useLocationSharing';

export function useGuardianList() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const { 
    sharingStatus, 
    formatRelativeTime, 
    shareLocation, 
    resendEmail 
  } = useLocationSharing();

  useEffect(() => {
    if (user?.id) {
      console.log('[DB] Accessing table: guardians');
      fetchGuardians();
    }
  }, [user?.id]);

  const fetchGuardians = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching guardians:', error);
        
        if (error.code === '42P01') {
          setError('A tabela de responsáveis ainda não existe. Execute a migração do banco de dados para criar a tabela.');
        } else {
          setError('Não foi possível carregar os responsáveis: ' + error.message);
        }
        setGuardians([]);
      } else {
        console.log('Guardians loaded:', data);
        setGuardians(data || []);
      }
    } catch (error) {
      console.error('Error fetching guardians:', error);
      setError('Erro ao buscar os responsáveis');
      setGuardians([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGuardian = async (id: string) => {
    try {
      const { error } = await supabase
        .from('guardians')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Responsável removido com sucesso"
      });

      fetchGuardians();
    } catch (error: any) {
      console.error('Error deleting guardian:', error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível remover o responsável",
        variant: "destructive"
      });
    }
  };

  return {
    guardians,
    isLoading,
    error,
    sharingStatus,
    fetchGuardians,
    deleteGuardian,
    shareLocation,
    resendEmail,
    formatRelativeTime
  };
}

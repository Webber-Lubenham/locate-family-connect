
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { GuardianData } from '@/types/database';

export const useGuardianData = (userId: string | undefined) => {
  const [guardians, setGuardians] = useState<GuardianData[]>([]);
  const [isLoadingGuardians, setIsLoadingGuardians] = useState(true);
  const [errorGuardians, setErrorGuardians] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGuardians = async () => {
    if (!userId) return;
    
    setIsLoadingGuardians(true);
    setErrorGuardians(null);
    
    try {
      const { data, error } = await supabase.client
        .from('guardians')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        setErrorGuardians('Erro ao buscar responsáveis: ' + error.message);
        setGuardians([]);
      } else {
        setGuardians(data || []);
      }
    } catch (err: any) {
      setErrorGuardians('Erro ao buscar responsáveis');
      setGuardians([]);
    } finally {
      setIsLoadingGuardians(false);
    }
  };

  const addGuardian = async (guardian: Partial<GuardianData>) => {
    if (!userId) {
      toast({ title: 'Erro', description: 'ID de usuário não disponível', variant: 'destructive' });
      return;
    }
    
    if (!guardian.full_name || !guardian.email) {
      toast({ title: 'Campos obrigatórios', description: 'Nome e email são obrigatórios', variant: 'destructive' });
      return;
    }
    
    try {
      // Fix: Ensure required fields are properly defined before passing to Supabase
      const guardianData = {
        student_id: userId,
        full_name: guardian.full_name,
        email: guardian.email,
        phone: guardian.phone || null,
        is_active: true
      };
      
      const { data, error } = await supabase.client
        .from('guardians')
        .insert([guardianData]);
        
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Responsável adicionado com sucesso' });
      fetchGuardians();
    } catch (err: any) {
      toast({ 
        title: 'Erro', 
        description: err.message || 'Erro ao adicionar responsável', 
        variant: 'destructive' 
      });
    }
  };

  const deleteGuardian = async (id: string) => {
    try {
      const { error } = await supabase.client
        .from('guardians')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Responsável removido com sucesso' });
      fetchGuardians();
    } catch (err: any) {
      toast({ 
        title: 'Erro', 
        description: err.message || 'Erro ao remover responsável', 
        variant: 'destructive' 
      });
    }
  };

  // Load guardians when userId changes
  useEffect(() => {
    if (userId) fetchGuardians();
  }, [userId]);

  return {
    guardians,
    isLoadingGuardians,
    errorGuardians,
    fetchGuardians,
    addGuardian,
    deleteGuardian
  };
};

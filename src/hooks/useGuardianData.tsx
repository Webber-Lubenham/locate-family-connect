
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { GuardianData } from '@/types/database';

export const useGuardianData = (userId: string | undefined) => {
  const [guardians, setGuardians] = useState<GuardianData[]>([]);
  const [isLoadingGuardians, setIsLoadingGuardians] = useState(true);
  const [errorGuardians, setErrorGuardians] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { toast } = useToast();

  const fetchGuardians = async () => {
    if (!userId) return;
    
    setIsLoadingGuardians(true);
    setErrorGuardians(null);
    
    try {
      console.log(`[DEBUG] Buscando responsáveis para o estudante ID: ${userId}`);
      const { data, error } = await supabase.client
        .from('guardians')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar responsáveis:', error);
        setErrorGuardians('Erro ao buscar responsáveis: ' + error.message);
        setGuardians([]);
      } else {
        console.log(`[DEBUG] Responsáveis encontrados: ${data?.length || 0}`, data);
        setGuardians(data || []);
      }
    } catch (err: any) {
      console.error('Erro ao buscar responsáveis:', err);
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

  // Nova função para buscar notificações não lidas quando o usuário for um responsável
  const fetchUnreadNotifications = async () => {
    if (!userId) return;
    
    try {
      const { data: userData } = await supabase.client
        .from('profiles')
        .select('email, user_type')
        .eq('user_id', userId)
        .single();
      
      if (userData && userData.user_type === 'parent') {
        // Usar a função RPC para contar notificações não lidas
        const { data, error } = await supabase.client
          .rpc('get_unread_notifications_count', { p_guardian_email: userData.email });
          
        if (!error && data !== null) {
          setUnreadNotifications(data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  // Configuração do canal de escuta em tempo real para notificações
  const setupRealtimeNotifications = async () => {
    if (!userId) return undefined; // Return undefined explicitly when userId is not available
    
    try {
      const { data: userData } = await supabase.client
        .from('profiles')
        .select('email, user_type')
        .eq('user_id', userId)
        .single();
      
      if (userData && userData.user_type === 'parent') {
        // Inscrever no canal para ouvir novas notificações
        const channel = supabase.client
          .channel('notification_changes')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'location_notifications',
              filter: `guardian_email=eq.${userData.email}`
            },
            (payload) => {
              console.log('Nova notificação recebida:', payload);
              // Incrementar contador de notificações não lidas
              setUnreadNotifications(prev => prev + 1);
              
              toast({
                title: 'Nova Localização',
                description: 'Um estudante compartilhou sua localização',
              });
            }
          )
          .subscribe();
          
        // Retornar função para limpar inscrição
        return () => {
          supabase.client.removeChannel(channel);
        };
      }
      return undefined; // Return undefined explicitly when userData doesn't match conditions
    } catch (err) {
      console.error('Erro ao configurar notificações em tempo real:', err);
      return undefined; // Return undefined in case of error
    }
  };

  // Load guardians when userId changes
  useEffect(() => {
    if (userId) {
      console.log('[DEBUG] useEffect triggered with userId:', userId);
      fetchGuardians();
      fetchUnreadNotifications();
      
      // Fix: Properly handle the Promise returned by setupRealtimeNotifications
      // by using an async IIFE (Immediately Invoked Function Expression)
      (async () => {
        const cleanup = await setupRealtimeNotifications();
        
        return () => {
          if (cleanup) {
            cleanup();
          }
        };
      })();
    }
  }, [userId]);

  return {
    guardians,
    isLoadingGuardians,
    errorGuardians,
    unreadNotifications,
    fetchGuardians,
    fetchUnreadNotifications,
    addGuardian,
    deleteGuardian
  };
};

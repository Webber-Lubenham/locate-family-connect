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

  // Função aprimorada para buscar notificações não lidas quando o usuário for um responsável
  const fetchUnreadNotifications = async () => {
    if (!userId) return;
    
    try {
      console.log('[DEBUG] Buscando dados do perfil para verificar tipo de usuário:', userId);
      
      const { data: userData } = await supabase.client
        .from('profiles')
        .select('email, user_type')
        .eq('user_id', userId)
        .single();
      
      console.log('[DEBUG] Dados do perfil recuperados:', userData);
      
      if (userData && userData.user_type === 'parent') {
        console.log('[DEBUG] Usuário é um responsável, buscando contagem de notificações para:', userData.email);
        
        // Usar a função RPC para contar notificações não lidas
        const { data, error } = await supabase.client
          .rpc('get_unread_notifications_count', { p_guardian_email: userData.email });
          
        if (error) {
          console.error('[DEBUG] Erro ao buscar contagem de notificações:', error);
        } else {
          console.log('[DEBUG] Contagem de notificações não lidas:', data);
          setUnreadNotifications(data !== null ? data : 0);
        }
      } else {
        console.log('[DEBUG] Usuário não é responsável, não buscando notificações');
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  // Função aprimorada para configuração do canal de escuta em tempo real para notificações
  const setupRealtimeNotifications = async () => {
    if (!userId) return undefined; // Return undefined explicitly when userId is not available
    
    try {
      console.log('[DEBUG] Configurando notificações em tempo real para usuário:', userId);
      
      const { data: userData } = await supabase.client
        .from('profiles')
        .select('email, user_type')
        .eq('user_id', userId)
        .single();
      
      if (userData && userData.user_type === 'parent') {
        console.log('[DEBUG] Configurando canal de tempo real para responsável:', userData.email);
        
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
              console.log('[DEBUG] Nova notificação recebida:', payload);
              // Incrementar contador de notificações não lidas
              setUnreadNotifications(prev => prev + 1);
              
              // Mostrar toast de notificação
              toast({
                title: 'Nova Localização',
                description: 'Um estudante compartilhou sua localização',
              });
            }
          )
          .subscribe();
          
        console.log('[DEBUG] Canal de notificação configurado e inscrito');
        
        // Também configurar escuta para alterações na tabela locations
        const locationsChannel = supabase.client
          .channel('locations_changes')
          .on('postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'locations'
            },
            (payload) => {
              console.log('[DEBUG] Nova localização inserida:', payload);
              // Verificar se é uma localização de um estudante vinculado ao responsável
              fetchUnreadNotifications();
            }
          )
          .subscribe();
        
        // Retornar função para limpar inscrição de ambos canais
        return () => {
          console.log('[DEBUG] Limpando canais de notificação');
          supabase.client.removeChannel(channel);
          supabase.client.removeChannel(locationsChannel);
        };
      }
      
      console.log('[DEBUG] Usuário não é responsável, não configurando notificações em tempo real');
      return undefined; // Return undefined explicitly when userData doesn't match conditions
    } catch (err) {
      console.error('[DEBUG] Erro ao configurar notificações em tempo real:', err);
      return undefined; // Return undefined in case of error
    }
  };

  // Load guardians and set up notifications when userId changes
  useEffect(() => {
    if (userId) {
      console.log('[DEBUG] useEffect triggered with userId:', userId);
      fetchGuardians();
      fetchUnreadNotifications();
      
      // Configuração de notificações em tempo real de forma correta
      let cleanupFunction: (() => void) | undefined;
      
      // Use async/await in an IIFE to properly handle the Promise
      (async () => {
        cleanupFunction = await setupRealtimeNotifications();
      })();
      
      // Retornar função de limpeza para useEffect
      return () => {
        if (typeof cleanupFunction === 'function') {
          cleanupFunction();
        }
      };
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

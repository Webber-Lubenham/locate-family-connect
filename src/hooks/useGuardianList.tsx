
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useUser } from '@/contexts/UnifiedAuthContext';
import { apiService } from '@/lib/api/api-service';

interface Guardian {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

type ShareStatus = 'idle' | 'sharing' | 'success' | 'error';

interface ShareStatusData {
  status: ShareStatus;
  message?: string;
  timestamp?: number;
}

export function useGuardianList() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharingStatus, setSharingStatus] = useState<Record<string, ShareStatusData>>({});
  const [lastSentLocation, setLastSentLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

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
        
        const initialStatus: Record<string, ShareStatusData> = {};
        data?.forEach(guardian => {
          initialStatus[guardian.id] = { status: 'idle' };
        });
        setSharingStatus(initialStatus);
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

  const shareLocation = async (id: string, email: string, guardianName: string) => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    setSharingStatus(prev => ({ 
      ...prev, 
      [id]: { 
        status: 'sharing',
        timestamp: Date.now()
      }
    }));

    toast({
      title: "Obtendo localização",
      description: "Aguarde enquanto obtemos sua localização..."
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          setLastSentLocation({lat: latitude, lng: longitude});
          
          console.log(`Compartilhando localização com ${guardianName}: `, {
            email,
            latitude,
            longitude,
            guardianName
          });

          const result = await apiService.shareLocation(
            email,
            latitude,
            longitude,
            user?.user_metadata?.full_name || 'Estudante EduConnect'
          );

          if (result) {
            setSharingStatus(prev => ({ 
              ...prev, 
              [id]: { 
                status: 'success',
                message: `Email enviado para ${email}`,
                timestamp: Date.now()
              }
            }));
            
            toast({
              title: "Localização compartilhada",
              description: `Localização enviada para ${guardianName} (${email})`
            });
          } else {
            throw new Error('Falha ao compartilhar localização');
          }
        } catch (error: any) {
          console.error('Error sharing location:', error);
          
          setSharingStatus(prev => ({ 
            ...prev, 
            [id]: { 
              status: 'error',
              message: error.message || 'Erro desconhecido',
              timestamp: Date.now()
            }
          }));
          
          toast({
            title: "Erro",
            description: "Não foi possível compartilhar sua localização. Verifique se o email do responsável está correto e seu firewall não está bloqueando o envio.",
            variant: "destructive"
          });
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        
        setSharingStatus(prev => ({ 
          ...prev, 
          [id]: { 
            status: 'error',
            message: `Erro de GPS: ${error.message}`,
            timestamp: Date.now()
          }
        }));
        
        toast({
          title: "Erro",
          description: `Não foi possível obter sua localização: ${error.message}. Verifique as permissões do navegador.`,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const resendEmail = (id: string, email: string, guardianName: string) => {
    if (lastSentLocation) {
      shareLocationWithCoordinates(id, email, guardianName, lastSentLocation.lat, lastSentLocation.lng);
    } else {
      shareLocation(id, email, guardianName);
    }
  };

  const shareLocationWithCoordinates = async (id: string, email: string, guardianName: string, latitude: number, longitude: number) => {
    setSharingStatus(prev => ({ 
      ...prev, 
      [id]: { 
        status: 'sharing',
        timestamp: Date.now()
      }
    }));

    try {
      console.log(`Recompartilhando localização com ${guardianName} usando coordenadas pré-existentes: `, {
        email,
        latitude,
        longitude
      });

      const result = await apiService.shareLocation(
        email,
        latitude,
        longitude,
        user?.user_metadata?.full_name || 'Estudante EduConnect'
      );

      if (result) {
        setSharingStatus(prev => ({ 
          ...prev, 
          [id]: { 
            status: 'success',
            message: `Email reenviado para ${email}`,
            timestamp: Date.now()
          }
        }));
        
        toast({
          title: "Localização compartilhada novamente",
          description: `Localização reenviada para ${guardianName} (${email})`
        });
      } else {
        throw new Error('Falha ao recompartilhar localização');
      }
    } catch (error: any) {
      console.error('Error resharing location:', error);
      
      setSharingStatus(prev => ({ 
        ...prev, 
        [id]: { 
          status: 'error',
          message: error.message || 'Erro desconhecido',
          timestamp: Date.now()
        }
      }));
      
      toast({
        title: "Erro",
        description: "Não foi possível reenviar sua localização. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'agora mesmo';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else {
      const hours = Math.floor(diff / 3600000);
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
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

export type { Guardian, ShareStatus, ShareStatusData };

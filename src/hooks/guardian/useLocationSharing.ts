
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { apiService } from '@/lib/api/api-service';
import { ShareStatusData, LocationCoordinates } from './types';
import { useUser } from '@/contexts/UnifiedAuthContext';

export function useLocationSharing() {
  const [sharingStatus, setSharingStatus] = useState<Record<string, ShareStatusData>>({});
  const [lastSentLocation, setLastSentLocation] = useState<LocationCoordinates | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

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

          // Usa apiService para compartilhar localização
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

  const shareLocationWithCoordinates = async (
    id: string, 
    email: string, 
    guardianName: string, 
    latitude: number, 
    longitude: number
  ) => {
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

  return {
    sharingStatus,
    lastSentLocation,
    formatRelativeTime,
    shareLocation,
    resendEmail,
    shareLocationWithCoordinates
  };
}


import { useState } from 'react';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';

type SharingStatus = {
  [guardianId: string]: {
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    timestamp?: number;
  }
};

export function useLocationSharing(senderName: string) {
  const [loading, setLoading] = useState(false);
  const [sharingStatus, setSharingStatus] = useState<SharingStatus>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  const { toast } = useToast();

  // Share location via email through the API
  const shareLocationByEmail = async (email: string, latitude: number, longitude: number, senderName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await apiService.shareLocation(
        email,
        latitude,
        longitude,
        senderName
      );
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Error sharing location:', error);
      setLoading(false);
      return false;
    }
  };

  // Request location via email
  const requestLocationByEmail = async (email: string, latitude: number, longitude: number, senderName: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Atualizando para compatibilidade com a nova assinatura (4 parâmetros em vez de 5)
      const result = await apiService.shareLocation(
        email,
        latitude,
        longitude,
        `${senderName} (solicitação de localização)` // Adicionando contexto no nome do remetente
      );
      
      setLoading(false);
      // Verificar o resultado conforme o tipo de retorno
      return result && typeof result === 'object' ? result.success : !!result;
    } catch (error) {
      console.error('Error requesting location:', error);
      setLoading(false);
      return false;
    }
  };

  // Share location with a specific guardian
  const shareLocation = async (guardian: GuardianData): Promise<void> => {
    setSharingStatus(prev => ({ 
      ...prev, 
      [guardian.id]: { 
        status: 'loading',
        timestamp: Date.now()
      }
    }));
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported by your browser');
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });
      
      const result = await shareLocationByEmail(
        guardian.email,
        position.coords.latitude,
        position.coords.longitude,
        senderName
      );
      
      if (result) {
        setSharingStatus(prev => ({ 
          ...prev, 
          [guardian.id]: { 
            status: 'success',
            message: `Email sent to ${guardian.email}`,
            timestamp: Date.now()
          }
        }));
        
        toast({
          title: "Location shared",
          description: `Location sent to ${guardian.full_name || guardian.email}`
        });
      } else {
        throw new Error('Failed to share location');
      }
    } catch (error: any) {
      console.error('Error sharing location:', error);
      setSharingStatus(prev => ({ 
        ...prev, 
        [guardian.id]: { 
          status: 'error',
          message: error.message || 'Unknown error',
          timestamp: Date.now()
        }
      }));
      
      toast({
        title: "Error",
        description: error.message || 'Failed to share location',
        variant: "destructive"
      });
    }
  };

  // Share location with all guardians
  const shareLocationAll = async (guardians: GuardianData[]): Promise<void> => {
    if (guardians.length === 0) {
      toast({
        title: "No guardians",
        description: "There are no guardians to share your location with",
        variant: "default"
      });
      return;
    }
    
    setIsSendingAll(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported by your browser');
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      let successCount = 0;
      
      // Initialize all as loading
      const initialStatus: SharingStatus = {};
      guardians.forEach(guardian => {
        initialStatus[guardian.id] = { 
          status: 'loading',
          timestamp: Date.now()
        };
      });
      setSharingStatus(initialStatus);
      
      // Share with each guardian
      for (const guardian of guardians) {
        try {
          const result = await shareLocationByEmail(
            guardian.email,
            latitude,
            longitude,
            senderName
          );
          
          if (result) {
            setSharingStatus(prev => ({ 
              ...prev, 
              [guardian.id]: { 
                status: 'success',
                timestamp: Date.now()
              }
            }));
            successCount++;
          } else {
            setSharingStatus(prev => ({ 
              ...prev, 
              [guardian.id]: { 
                status: 'error',
                timestamp: Date.now()
              }
            }));
          }
        } catch (error) {
          console.error(`Error sharing with ${guardian.email}:`, error);
          setSharingStatus(prev => ({ 
            ...prev, 
            [guardian.id]: { 
              status: 'error',
              timestamp: Date.now()
            }
          }));
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Location shared",
          description: `Location sent to ${successCount} guardian${successCount > 1 ? 's' : ''}`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error sharing location to all:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to get your location',
        variant: "destructive"
      });
    } finally {
      setIsSendingAll(false);
    }
  };

  return {
    loading,
    sharingStatus,
    isSendingAll,
    shareLocation,
    shareLocationAll,
    shareLocationByEmail,
    requestLocationByEmail
  };
}


import { useState } from 'react';
import { apiService } from '@/lib/api/api-service';
import { useToast } from '@/components/ui/use-toast';
import { GuardianData } from '@/types/database';

export const useLocationSharing = (userName: string) => {
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  const { toast } = useToast();

  const shareLocation = async (guardian: GuardianData) => {
    if (!navigator.geolocation) {
      toast({ title: 'Erro', description: 'Seu navegador não suporta geolocalização', variant: 'destructive' });
      return;
    }
    
    setSharingStatus(prev => ({ ...prev, [guardian.id]: 'loading' }));
    toast({ title: 'Obtendo localização', description: 'Aguarde enquanto obtemos sua localização...' });
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const result = await apiService.shareLocation(
        guardian.email,
        latitude,
        longitude,
        userName
      );
      
      setSharingStatus(prev => ({ ...prev, [guardian.id]: result ? 'success' : 'error' }));
      
      if (result) {
        toast({ title: 'Localização compartilhada', description: `Localização enviada para ${guardian.full_name}` });
      }
    }, (error) => {
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
      toast({ 
        title: 'Erro', 
        description: `Não foi possível obter sua localização: ${error.message}`, 
        variant: 'destructive' 
      });
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  const shareLocationAll = async (guardians: GuardianData[]) => {
    if (!navigator.geolocation) {
      toast({ title: 'Erro', description: 'Seu navegador não suporta geolocalização', variant: 'destructive' });
      return;
    }
    
    setIsSendingAll(true);
    toast({ title: 'Obtendo localização', description: 'Aguarde enquanto obtemos sua localização...' });
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      let successCount = 0;
      
      for (const guardian of guardians) {
        const result = await apiService.shareLocation(
          guardian.email,
          latitude,
          longitude,
          userName
        );
        
        if (result) successCount++;
      }
      
      toast({ 
        title: 'Localização compartilhada', 
        description: `Localização enviada para ${successCount} responsável(is).` 
      });
      
      setIsSendingAll(false);
    }, (error) => {
      toast({ 
        title: 'Erro', 
        description: `Não foi possível obter sua localização: ${error.message}`, 
        variant: 'destructive' 
      });
      
      setIsSendingAll(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  return {
    sharingStatus,
    isSendingAll,
    shareLocation,
    shareLocationAll
  };
};

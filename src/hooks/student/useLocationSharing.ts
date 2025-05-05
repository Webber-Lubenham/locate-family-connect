import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';
import * as locationCache from '@/lib/utils/location-cache';
import { recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';

export function useLocationSharing(userFullName: string, isMobile: boolean, setAlertOpen: (open: boolean) => void, setAlertSuccess: (success: boolean) => void, setAlertMessage: (message: string) => void, setAlertDetails: (details: string) => void) {
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  const { toast } = useToast();

  // Obter a posição atual com melhor precisão
  const getCurrentPositionAccurate = useCallback(async (): Promise<{latitude: number, longitude: number} | null> => {
    // Primeiramente, tenta obter do elemento do mapa (mais preciso)
    const mapInstance = document.querySelector('[data-map-instance="true"]');
    const mapPositionAttr = mapInstance?.getAttribute('data-position');
    
    if (mapPositionAttr) {
      try {
        const mapPosition = JSON.parse(mapPositionAttr);
        console.log('[LocationSharing] Usando posição do mapa:', mapPosition);
        return {
          latitude: mapPosition.latitude,
          longitude: mapPosition.longitude
        };
      } catch (e) {
        console.error('[LocationSharing] Erro ao ler posição do mapa:', e);
      }
    }
    
    // Fallback para API de geolocalização
    try {
      console.log('[LocationSharing] Obtendo nova posição de geolocalização');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('[LocationSharing] Erro ao obter posição:', error);
      return null;
    }
  }, []);

  // Função para salvar a localização no banco de dados
  const saveLocationToDatabase = useCallback(async (latitude: number, longitude: number): Promise<boolean> => {
    try {
      console.log(`[LocationSharing] Salvando localização no banco: ${latitude}, ${longitude}`);
      
      // Opção 1: Usar função RPC específica (recomendado)
      const { data, error } = await supabase.rpc('save_student_location', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_shared_with_guardians: true
      });
      
      if (error) {
        console.error('[LocationSharing] Erro ao salvar localização via RPC:', error);
        
        // Opção 2: Fallback para inserção direta na tabela locations
        const { error: insertError } = await supabase
          .from('locations')
          .insert([{
            latitude,
            longitude,
            shared_with_guardians: true
          }]);
        
        if (insertError) {
          console.error('[LocationSharing] Erro no fallback de inserção direta:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('[LocationSharing] Exceção ao salvar localização:', error);
      return false;
    }
  }, []);

  // Handle share location to all guardians
  const handleShareAll = async (guardians: GuardianData[]) => {
    setIsSendingAll(true);
    try {
      // Obter a posição atual
      const position = await getCurrentPositionAccurate();
      
      if (!position) {
        throw new Error('Não foi possível obter sua localização atual');
      }
      
      const { latitude, longitude } = position;
      
      // Salvar a localização no banco de dados
      const savedToDb = await saveLocationToDatabase(latitude, longitude);
      if (!savedToDb) {
        console.warn('[LocationSharing] Não foi possível salvar a localização no banco de dados');
      }
      
      let successCount = 0;
      let failCount = 0;
      
      // Send to each guardian
      for (const guardian of guardians) {
        try {
          await shareLocationToGuardian(guardian, latitude, longitude);
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`Falha ao compartilhar com ${guardian.email}:`, err);
        }
      }
      
      // Resumo final do compartilhamento
      if (isMobile) {
        // Em mobile usamos o alerta modal para o resultado final
        setAlertSuccess(successCount > 0);
        setAlertMessage(
          successCount > 0 
            ? `Localização enviada com sucesso para ${successCount} responsável(is)${failCount > 0 ? ` (${failCount} falha(s))` : ''}` 
            : "Não foi possível compartilhar sua localização"
        );
        setAlertDetails(successCount > 0 
          ? 'Suas informações de localização foram compartilhadas por e-mail'
          : 'Verifique as permissões de localização e tente novamente');
        setAlertOpen(true);
      } else {
        // Em desktop mantemos o toast
        toast({
          title: "Compartilhamento concluído",
          description: successCount > 0 
            ? `Localização enviada com sucesso para ${successCount} responsável(is)${failCount > 0 ? ` (${failCount} falha(s))` : ''}` 
            : "Não foi possível compartilhar sua localização",
          variant: successCount > 0 ? "default" : "destructive",
          duration: 4000,
        });
      }
      
      // Atualiza o status visual dos botões
      setSharingStatus(prevStatus => {
        const newStatus: Record<string, string> = {};
        for (const guardian of guardians) {
          newStatus[guardian.id] = 'success';
        }
        return newStatus;
      });
      
    } catch (error: any) {
      console.error('Error sharing location to all:', error);
      
      // Feedback de erro geral
      if (isMobile) {
        // Em mobile usamos o alerta modal para o erro
        setAlertSuccess(false);
        setAlertMessage("Erro ao obter localização");
        setAlertDetails("Verifique se você deu permissão de localização ao navegador");
        setAlertOpen(true);
      } else {
        // Em desktop mantemos o toast
        toast({
          title: "Erro ao obter localização",
          description: "Verifique se você deu permissão de localização ao navegador",
          variant: "destructive",
          duration: 4000,
        });
      }
    } finally {
      setIsSendingAll(false);
    }
  };
  
  // Share location with a specific guardian
  const shareLocationToGuardian = async (guardian: GuardianData, providedLat?: number, providedLong?: number): Promise<void> => {
    setSharingStatus(prev => ({ ...prev, [guardian.id]: 'loading' }));
    
    try {
      let latitude: number, longitude: number;
      
      if (providedLat !== undefined && providedLong !== undefined) {
        // Use provided coordinates if available
        latitude = providedLat;
        longitude = providedLong;
      } else {
        // Otherwise, get current position
        const position = await getCurrentPositionAccurate();
        
        if (!position) {
          throw new Error('Não foi possível obter sua localização atual');
        }
        
        ({ latitude, longitude } = position);
        
        // Salvar no banco de dados
        await saveLocationToDatabase(latitude, longitude);
      }
      
      try {
        // Compartilhar via email
        const result = await apiService.shareLocation(
          guardian.email,
          latitude,
          longitude,
          userFullName
        );
        
        if (result.success) {
          setSharingStatus(prev => ({ ...prev, [guardian.id]: 'success' }));
          
          // Em dispositivos móveis usamos o alerta modal em vez do toast
          if (isMobile) {
            setAlertSuccess(true);
            setAlertMessage(`Localização enviada com sucesso para ${guardian.full_name || guardian.email}`);
            setAlertDetails('A localização atual foi compartilhada por e-mail');
            setAlertOpen(true); // Isto ativa o alerta modal que não deixa a tela ficar branca
          } else {
            // Em desktop mantemos o toast
            toast({
              title: "Localização compartilhada",
              description: `Localização enviada com sucesso para ${guardian.full_name || guardian.email}`,
              variant: "default",
              duration: 3000,
            });
          }
        } else {
          throw new Error(result.message || 'Falha ao compartilhar localização');
        }
      } catch (apiError) {
        console.error('Erro na API de compartilhamento:', apiError);
        
        // Armazenar no cache local para tentar mais tarde
        locationCache.addPendingShare(
          guardian.email, 
          userFullName, 
          latitude, 
          longitude
        );
        
        // Registra o evento de serviço
        recordServiceEvent(
          ServiceType.EMAIL,
          SeverityLevel.WARNING,
          'Falha ao enviar email de localização - armazenado no cache',
          { guardianEmail: guardian.email, latitude, longitude }
        );
        
        // Mostra notificação diferenciada para modo offline
        if (isMobile) {
          setAlertSuccess(true); // Ainda mostramos como sucesso para não alarmar o usuário
          setAlertMessage(`Localização armazenada para ${guardian.full_name || guardian.email}`);
          setAlertDetails('Será compartilhada automaticamente quando a conexão estiver disponível');
          setAlertOpen(true);
        } else {
          toast({
            title: "Localização armazenada",
            description: `Localização salva e será compartilhada automaticamente mais tarde`,
            variant: "default",
            duration: 3000,
          });
        }
      }
    } catch (error: any) {
      console.error('Error sharing location:', error);
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
      
      // Em dispositivos móveis usamos o alerta modal para erros também
      if (isMobile) {
        setAlertSuccess(false);
        setAlertMessage(error?.message || "Não foi possível compartilhar sua localização");
        setAlertDetails("Verifique sua permissão de localização e tente novamente");
        setAlertOpen(true); // Isto ativa o alerta modal que não deixa a tela ficar branca
      } else {
        // Em desktop mantemos o toast para erros
        toast({
          title: "Erro ao compartilhar",
          description: error?.message || "Não foi possível compartilhar sua localização",
          variant: "destructive",
          duration: 4000,
        });
      }
    }
  };

  return {
    sharingStatus,
    isSendingAll,
    handleShareAll,
    shareLocationToGuardian
  };
}

// Import here to avoid circular dependencies
import { supabase } from '@/lib/supabase';

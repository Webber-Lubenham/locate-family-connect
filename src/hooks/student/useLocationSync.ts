
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as locationCache from '@/lib/utils/location-cache';
import { useToast } from '@/hooks/use-toast';
import { recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';

type LocationResponse = {
  id?: string | number;
  [key: string]: any;
}

export function useLocationSync(userId?: string) {
  const [hasPendingLocations, setHasPendingLocations] = useState(false);
  const { toast } = useToast();

  // Tenta sincronizar localizações pendentes
  const syncPendingLocations = useCallback(async () => {
    if (!userId) return;
    
    try {
      const pendingLocations = locationCache.getLocationCache().filter(
        loc => loc._pendingSync === true
      );
      
      let syncedCount = 0;
      
      for (const location of pendingLocations) {
        try {
          // Tenta salvar no banco
          const { data, error } = await supabase.rpc('save_student_location', {
            p_latitude: location.latitude,
            p_longitude: location.longitude,
            p_shared_with_guardians: location.shared_with_guardians
          });
          
          if (!error && data) {
            // Marca como sincronizado com o ID retornado pelo servidor
            let serverId = '';
            
            // Tratamento seguro de diferentes formatos de resposta
            if (typeof data === 'string') {
              serverId = data;
            } else if (data && typeof data === 'object') {
              // Type guard para garantir que data é um objeto com uma propriedade id
              const response = data as LocationResponse;
              
              // Verificar se o objeto tem a propriedade id explicitamente
              if (response.id !== undefined) {
                serverId = String(response.id);
              } else {
                // Fallback genérico quando não tem id
                serverId = `sync-${Date.now()}`;
                console.warn('Formato de ID não identificado:', data);
              }
            } else {
              // Fallback caso não seja possível obter um ID válido
              serverId = `sync-${Date.now()}`;
              console.warn('Formato de dados não reconhecido:', data);
            }
            
            if (location._localId) {
              locationCache.markLocationSynced(location._localId, serverId);
            }
            syncedCount++;
            
            // Agora tenta enviar emails pendentes
            const pendingShares = locationCache.getPendingShares();
            for (const share of pendingShares) {
              try {
                const result = await apiService.shareLocation(
                  share.guardianEmail,
                  share.latitude,
                  share.longitude,
                  share.studentName
                );
                
                if (result.success) {
                  locationCache.removePendingShare(share.id);
                } else {
                  locationCache.incrementShareAttempt(share.id);
                }
              } catch (err) {
                console.error('Erro ao enviar email pendente:', err);
              }
            }
          }
        } catch (syncError) {
          console.error('Erro ao sincronizar localização pendente:', syncError);
        }
      }
      
      // Atualiza o status
      setHasPendingLocations(locationCache.hasPendingLocations());
      
      if (syncedCount > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${syncedCount} localizações sincronizadas com sucesso`,
          variant: "default",
          action: {
            label: "OK", 
            onClick: () => console.log("Toast dismissed")
          }
        });
        
        locationCache.updateLastSyncTimestamp();
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados pendentes:', error);
    }
  }, [userId, toast]);

  // Verifica e atualiza o status de pendências no cache
  useEffect(() => {
    const checkPendingLocations = () => {
      const hasPending = locationCache.hasPendingLocations();
      setHasPendingLocations(hasPending);
      
      if (hasPending) {
        toast({
          title: "Localizações pendentes",
          description: "Existem localizações não compartilhadas",
          variant: "default",
          action: {
            label: "Tentar sincronizar",
            onClick: syncPendingLocations
          }
        });
      }
    };
    
    checkPendingLocations();
    
    // Verifica a cada 60 segundos
    const interval = setInterval(checkPendingLocations, 60000);
    return () => clearInterval(interval);
  }, [toast, syncPendingLocations]);

  return {
    hasPendingLocations,
    syncPendingLocations,
  };
}

// Import here to avoid circular dependencies
import { apiService } from '@/lib/api/api-service';

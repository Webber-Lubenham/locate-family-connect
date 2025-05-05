
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as locationCache from '@/lib/utils/location-cache';
import { useToast } from '@/components/ui/use-toast';
import { recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';

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
            // Marca como sincronizado
            locationCache.markLocationSynced(location._localId as string, data.id);
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
          variant: "default"
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
          action: (
            <button 
              onClick={syncPendingLocations}
              className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium"
            >
              Tentar sincronizar
            </button>
          )
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

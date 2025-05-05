import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import * as locationCache from '@/lib/utils/location-cache';
import { recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';
import { useGeolocation } from './useGeolocation';
import { useLocationDatabase } from './useLocationDatabase';
import { useMobileAlert, MobileAlertProps } from './useMobileAlert';

/**
 * Hook for location sharing functionality
 */
export function useLocationSharing(
  userFullName: string, 
  isMobile: boolean, 
  alertProps: MobileAlertProps
) {
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  const { toast } = useToast();
  
  // Custom hooks
  const { getCurrentPositionAccurate } = useGeolocation();
  const { saveLocationToDatabase } = useLocationDatabase();
  const { showMobileAlert } = useMobileAlert(alertProps);

  /**
   * Share location with a specific guardian
   */
  const shareLocationToGuardian = useCallback(async (
    guardian: GuardianData, 
    providedLat?: number, 
    providedLong?: number
  ): Promise<void> => {
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
        
        // Save to database
        await saveLocationToDatabase(latitude, longitude);
      }
      
      try {
        // Share via email
        const result = await apiService.shareLocation(
          guardian.email,
          latitude,
          longitude,
          userFullName
        );
        
        if (result.success) {
          setSharingStatus(prev => ({ ...prev, [guardian.id]: 'success' }));
          
          // On mobile devices use modal alert instead of toast
          if (isMobile) {
            showMobileAlert(
              true,
              `Localização enviada com sucesso para ${guardian.full_name || guardian.email}`,
              'A localização atual foi compartilhada por e-mail'
            );
          } else {
            // On desktop keep using toast
            toast({
              title: "Localização compartilhada",
              description: `Localização enviada com sucesso para ${guardian.full_name || guardian.email}`,
              variant: "default"
            });
          }
        } else {
          throw new Error(result.message || 'Falha ao compartilhar localização');
        }
      } catch (apiError) {
        console.error('Erro na API de compartilhamento:', apiError);
        
        // Store in local cache for later
        locationCache.addPendingShare(
          guardian.email, 
          userFullName, 
          latitude, 
          longitude
        );
        
        // Record service event
        recordServiceEvent(
          ServiceType.EMAIL,
          SeverityLevel.WARNING,
          'Falha ao enviar email de localização - armazenado no cache',
          { guardianEmail: guardian.email, latitude, longitude }
        );
        
        // Show differentiated notification for offline mode
        if (isMobile) {
          showMobileAlert(
            true, // Still show as success to not alarm the user
            `Localização armazenada para ${guardian.full_name || guardian.email}`,
            'Será compartilhada automaticamente quando a conexão estiver disponível'
          );
        } else {
          toast({
            title: "Localização armazenada",
            description: `Localização salva e será compartilhada automaticamente mais tarde`,
            variant: "default"
          });
        }
      }
    } catch (error: any) {
      console.error('Error sharing location:', error);
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
      
      // On mobile devices use modal alert for errors too
      if (isMobile) {
        showMobileAlert(
          false,
          error?.message || "Não foi possível compartilhar sua localização",
          "Verifique sua permissão de localização e tente novamente"
        );
      } else {
        // On desktop keep toast for errors
        toast({
          title: "Erro ao compartilhar",
          description: error?.message || "Não foi possível compartilhar sua localização",
          variant: "destructive"
        });
      }
    }
  }, [getCurrentPositionAccurate, saveLocationToDatabase, userFullName, isMobile, showMobileAlert, toast]);

  /**
   * Share location with all guardians
   */
  const handleShareAll = useCallback(async (guardians: GuardianData[]) => {
    setIsSendingAll(true);
    try {
      // Get current position
      const position = await getCurrentPositionAccurate();
      
      if (!position) {
        throw new Error('Não foi possível obter sua localização atual');
      }
      
      const { latitude, longitude } = position;
      
      // Save location to database
      const savedToDb = await saveLocationToDatabase(latitude, longitude);
      if (!savedToDb) {
        console.warn('[LocationSharing] Could not save location to database');
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
      
      // Final sharing summary
      if (isMobile) {
        // On mobile use modal alert for final result
        showMobileAlert(
          successCount > 0,
          successCount > 0 
            ? `Localização enviada com sucesso para ${successCount} responsável(is)${failCount > 0 ? ` (${failCount} falha(s))` : ''}` 
            : "Não foi possível compartilhar sua localização",
          successCount > 0 
            ? 'Suas informações de localização foram compartilhadas por e-mail'
            : 'Verifique as permissões de localização e tente novamente'
        );
      } else {
        // On desktop keep toast
        toast({
          title: "Compartilhamento concluído",
          description: successCount > 0 
            ? `Localização enviada com sucesso para ${successCount} responsável(is)${failCount > 0 ? ` (${failCount} falha(s))` : ''}` 
            : "Não foi possível compartilhar sua localização",
          variant: successCount > 0 ? "default" : "destructive"
        });
      }
      
      // Update visual status of buttons
      setSharingStatus(prevStatus => {
        const newStatus: Record<string, string> = {};
        for (const guardian of guardians) {
          newStatus[guardian.id] = 'success';
        }
        return newStatus;
      });
      
    } catch (error: any) {
      console.error('Error sharing location to all:', error);
      
      // General error feedback
      if (isMobile) {
        // On mobile use modal alert for error
        showMobileAlert(
          false,
          "Erro ao obter localização",
          "Verifique se você deu permissão de localização ao navegador"
        );
      } else {
        // On desktop keep toast
        toast({
          title: "Erro ao obter localização",
          description: "Verifique se você deu permissão de localização ao navegador",
          variant: "destructive"
        });
      }
    } finally {
      setIsSendingAll(false);
    }
  }, [getCurrentPositionAccurate, saveLocationToDatabase, shareLocationToGuardian, isMobile, showMobileAlert, toast]);

  return {
    sharingStatus,
    isSendingAll,
    handleShareAll,
    shareLocationToGuardian
  };
}

// Import Supabase here to avoid circular dependencies
import { supabase } from '@/lib/supabase';

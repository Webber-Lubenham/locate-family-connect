import { useCallback } from 'react';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/auth';
import * as locationCache from '@/lib/utils/location-cache';
import { recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';
import { useToast } from '@/hooks/use-toast';
import { MobileAlertProps, useMobileAlert } from './useMobileAlert';

/**
 * Hook para gerenciar o compartilhamento de localização via email
 */
export function useLocationShare(
  userFullName: string,
  isMobile: boolean,
  alertProps: MobileAlertProps
) {
  const { toast } = useToast();
  const { showMobileAlert } = useMobileAlert(alertProps);

  /**
   * Compartilha localização via email para um responsável específico
   */
  const shareViaEmail = useCallback(async (
    guardian: GuardianData,
    latitude: number,
    longitude: number,
  ): Promise<boolean> => {
    try {
      // Compartilhar via email
      const result = await apiService.shareLocation(
        guardian.email,
        latitude,
        longitude,
        userFullName
      );
      
      if (result.success) {
        // No dispositivo móvel, usar alerta modal em vez de toast
        if (isMobile) {
          showMobileAlert(
            true,
            `Localização enviada com sucesso para ${guardian.full_name || guardian.email}`,
            'A localização atual foi compartilhada por e-mail'
          );
        } else {
          // Em desktop continuar usando toast
          toast({
            title: "Localização compartilhada",
            description: `Localização enviada com sucesso para ${guardian.full_name || guardian.email}`,
            variant: "default"
          });
        }
        return true;
      } else {
        throw new Error(result.message || 'Falha ao compartilhar localização');
      }
    } catch (apiError) {
      console.error('Erro na API de compartilhamento:', apiError);
      
      // Armazenar no cache local para posterior envio
      locationCache.addPendingShare(
        guardian.email, 
        userFullName, 
        latitude, 
        longitude
      );
      
      // Registrar evento de serviço
      recordServiceEvent(
        ServiceType.EMAIL,
        SeverityLevel.WARNING,
        'Falha ao enviar email de localização - armazenado no cache',
        { guardianEmail: guardian.email, latitude, longitude }
      );
      
      // Mostrar notificação diferenciada para modo offline
      if (isMobile) {
        showMobileAlert(
          true, // Ainda mostrar como sucesso para não alarmar o usuário
          `Localização armazenada para ${guardian.full_name || guardian.email}`,
          'Será enviada automaticamente quando a conexão for restabelecida'
        );
      } else {
        // Em desktop, manter toast para erros
        toast({
          title: "Localização armazenada",
          description: `Será enviada para ${guardian.full_name || guardian.email} quando a conexão for restabelecida`,
          variant: "default"
        });
      }
      return false;
    }
  }, [userFullName, isMobile, showMobileAlert, toast]);

  /**
   * Mostra mensagem de erro apropriada para o dispositivo
   */
  const showErrorMessage = useCallback((error?: Error) => {
    if (isMobile) {
      showMobileAlert(
        false,
        error?.message || "Não foi possível compartilhar sua localização",
        "Verifique sua permissão de localização e tente novamente"
      );
    } else {
      // Em desktop manter toast para erros
      toast({
        title: "Erro ao compartilhar",
        description: error?.message || "Não foi possível compartilhar sua localização",
        variant: "destructive"
      });
    }
  }, [isMobile, showMobileAlert, toast]);

  /**
   * Mostra resumo do compartilhamento para múltiplos responsáveis
   */
  const showSharingSummary = useCallback((successCount: number, failCount: number) => {
    if (isMobile) {
      // Em mobile usar alerta modal para resultado final
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
      // Em desktop manter toast
      toast({
        title: "Compartilhamento concluído",
        description: successCount > 0 
          ? `Localização enviada com sucesso para ${successCount} responsável(is)${failCount > 0 ? ` (${failCount} falha(s))` : ''}` 
          : "Não foi possível compartilhar sua localização",
        variant: successCount > 0 ? "default" : "destructive"
      });
    }
  }, [isMobile, showMobileAlert, toast]);

  return {
    shareViaEmail,
    showErrorMessage,
    showSharingSummary
  };
}

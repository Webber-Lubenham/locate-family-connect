import { useState, useCallback } from 'react';
import { GuardianData } from '@/types/auth';
import { useGeolocation } from './useGeolocation';
import { useLocationDatabase } from './useLocationDatabase';
import { useLocationShare } from './useLocationShare';
import { MobileAlertProps } from './useMobileAlert';

/**
 * Hook principal para funcionalidade de compartilhamento de localização
 * Agora refatorado para ser mais modular e fácil de manter
 */
export function useLocationSharing(
  userFullName: string, 
  isMobile: boolean, 
  alertProps: MobileAlertProps
) {
  // Estados
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  
  // Hooks modulares
  const { getCurrentPositionAccurate } = useGeolocation();
  const { saveLocationToDatabase } = useLocationDatabase();
  const { 
    shareViaEmail, 
    showErrorMessage, 
    showSharingSummary 
  } = useLocationShare(userFullName, isMobile, alertProps);

  /**
   * Compartilha localização com um responsável específico
   */
  const shareLocationToGuardian = useCallback(async (
    guardian: GuardianData, 
    providedLat?: number, 
    providedLong?: number
  ) => {
    try {
      let latitude: number, longitude: number;
      
      if (providedLat !== undefined && providedLong !== undefined) {
        // Usar coordenadas fornecidas quando disponíveis
        latitude = providedLat;
        longitude = providedLong;
      } else {
        // Caso contrário, obter posição atual
        const position = await getCurrentPositionAccurate();
        
        if (!position) {
          throw new Error('Não foi possível obter sua localização atual');
        }
        
        ({ latitude, longitude } = position);
        
        // Salvar no banco de dados
        await saveLocationToDatabase(latitude, longitude);
      }
      
      // Compartilhar via email
      const success = await shareViaEmail(guardian, latitude, longitude);
      if (success) {
        setSharingStatus(prev => ({ ...prev, [guardian.id]: 'success' }));
      }
    } catch (error: any) {
      console.error('Erro ao compartilhar localização:', error);
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
      showErrorMessage(error);
    }
  }, [getCurrentPositionAccurate, saveLocationToDatabase, shareViaEmail, showErrorMessage]);

  /**
   * Compartilha localização com todos os responsáveis
   */
  const handleShareAll = useCallback(async (guardians: GuardianData[]) => {
    setIsSendingAll(true);
    try {
      // Obter posição atual
      const position = await getCurrentPositionAccurate();
      
      if (!position) {
        throw new Error('Não foi possível obter sua localização atual');
      }
      
      const { latitude, longitude } = position;
      
      // Salvar localização no banco de dados
      const savedToDb = await saveLocationToDatabase(latitude, longitude);
      if (!savedToDb) {
        console.warn('[LocationSharing] Não foi possível salvar localização no banco de dados');
      }
      
      let successCount = 0;
      let failCount = 0;
      
      // Enviar para cada responsável
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
      showSharingSummary(successCount, failCount);
      
      // Atualizar status visual dos botões
      setSharingStatus(prevStatus => {
        const newStatus: Record<string, string> = {};
        for (const guardian of guardians) {
          newStatus[guardian.id] = 'success';
        }
        return newStatus;
      });
    } catch (error: any) {
      console.error('Erro ao compartilhar localização para todos:', error);
      showErrorMessage(error);
    } finally {
      setIsSendingAll(false);
    }
  }, [getCurrentPositionAccurate, saveLocationToDatabase, shareLocationToGuardian, showSharingSummary, showErrorMessage]);

  return {
    sharingStatus,
    isSendingAll,
    handleShareAll,
    shareLocationToGuardian
  };
}

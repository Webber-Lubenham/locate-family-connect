
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import StudentInfoPanel from '@/components/StudentInfoPanel';
import StudentLocationMap from '@/components/StudentLocationMap';
import GuardianManager from '@/components/GuardianManager';
import { useGuardianData } from '@/hooks/useGuardianData';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';
import { SharedLocationAlert } from '@/components/ui/shared-location-alert';
import { isMobileDevice } from '@/lib/utils/device-detection';
import { supabase } from '@/lib/supabase';
import * as locationCache from '@/lib/utils/location-cache';
import { initializeMonitoring, recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';

const StudentDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  
  // Estados para o alerta de compartilhamento (especialmente para mobile)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertDetails, setAlertDetails] = useState('');
  const [hasPendingLocations, setHasPendingLocations] = useState(false);
  
  // Detectar dispositivo mobile
  const isMobile = isMobileDevice();
  
  // Inicializar monitoramento de serviços
  useEffect(() => {
    initializeMonitoring();
  }, []);

  // Get user information
  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userPhone = user?.user_metadata?.phone || 'Não informado';

  // Guardian data management using our custom hook
  const { 
    loading: isLoadingGuardians, 
    error, 
    guardians, 
    fetchGuardians,
    addGuardian, 
    removeGuardian
  } = useGuardianData();

  // Fetch guardians when user is available
  useEffect(() => {
    if (user?.id) {
      fetchGuardians(user.id);
    }
  }, [user?.id, fetchGuardians]);

  // Função para salvar a localização no banco de dados
  const saveLocationToDatabase = useCallback(async (latitude: number, longitude: number): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      console.log(`[StudentDashboard] Salvando localização no banco: ${latitude}, ${longitude}`);
      
      // Opção 1: Usar função RPC específica (recomendado)
      const { data, error } = await supabase.rpc('save_student_location', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_shared_with_guardians: true
      });
      
      if (error) {
        console.error('[StudentDashboard] Erro ao salvar localização via RPC:', error);
        
        // Opção 2: Fallback para inserção direta na tabela locations
        const { error: insertError } = await supabase
          .from('locations')
          .insert([{
            user_id: user.id,
            latitude,
            longitude,
            shared_with_guardians: true
          }]);
        
        if (insertError) {
          console.error('[StudentDashboard] Erro no fallback de inserção direta:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('[StudentDashboard] Exceção ao salvar localização:', error);
      return false;
    }
  }, [user?.id]);

  // Obter a posição atual com melhor precisão
  const getCurrentPositionAccurate = useCallback(async (): Promise<{latitude: number, longitude: number} | null> => {
    // Primeiramente, tenta obter do elemento do mapa (mais preciso)
    const mapInstance = document.querySelector('[data-map-instance="true"]');
    const mapPositionAttr = mapInstance?.getAttribute('data-position');
    
    if (mapPositionAttr) {
      try {
        const mapPosition = JSON.parse(mapPositionAttr);
        console.log('[StudentDashboard] Usando posição do mapa:', mapPosition);
        return {
          latitude: mapPosition.latitude,
          longitude: mapPosition.longitude
        };
      } catch (e) {
        console.error('[StudentDashboard] Erro ao ler posição do mapa:', e);
      }
    }
    
    // Fallback para API de geolocalização
    try {
      console.log('[StudentDashboard] Obtendo nova posição de geolocalização');
      
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
      console.error('[StudentDashboard] Erro ao obter posição:', error);
      return null;
    }
  }, []);

  // Handle share location to all guardians
  const handleShareAll = async () => {
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
        console.warn('[StudentDashboard] Não foi possível salvar a localização no banco de dados');
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
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
  }, [toast]);
  
  // Tenta sincronizar localizações pendentes
  const syncPendingLocations = useCallback(async () => {
    if (!user?.id) return;
    
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
  }, [user?.id, toast]);

  // Wrapper for addGuardian to convert return type
  const handleAddGuardian = async (guardianData: Partial<GuardianData>): Promise<void> => {
    if (user?.id) {
      await addGuardian(user.id, guardianData.email || '', guardianData.relationship_type || undefined);
    }
  };

  // Wrapper for removeGuardian to convert return type
  const handleRemoveGuardian = async (id: string): Promise<void> => {
    const guardian = guardians.find(g => g.id === id);
    if (guardian) {
      await removeGuardian(guardian);
    }
  };

  return (
    <div data-cy="dashboard-container" className="flex flex-col min-h-screen p-4">      
      {hasPendingLocations && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-amber-500">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">Existem localizações pendentes de compartilhamento.</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={syncPendingLocations}
                  className="inline-flex bg-amber-50 rounded-md p-1.5 text-amber-500 hover:bg-amber-100 focus:outline-none"
                >
                  <span>Sincronizar agora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Student information panel */}
        <StudentInfoPanel 
          userFullName={userFullName} 
          email={user?.email} 
          phone={userPhone} 
        />

        {/* Location map */}
        <StudentLocationMap 
          onShareAll={handleShareAll} 
          isSendingAll={isSendingAll} 
          guardianCount={guardians.length} 
        />
      </div>

      {/* Guardian management section */}
      <GuardianManager 
        guardians={guardians}
        isLoading={isLoadingGuardians}
        error={error}
        onAddGuardian={handleAddGuardian}
        onDeleteGuardian={handleRemoveGuardian}
        onShareLocation={(guardian) => shareLocationToGuardian(guardian)}
        sharingStatus={sharingStatus}
      />
      
      {/* Alerta modal para dispositivos móveis - isso resolve o problema da tela em branco */}
      <SharedLocationAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        success={alertSuccess}
        message={alertMessage}
        details={alertDetails}
      />
    </div>
  );
};

export default StudentDashboard;

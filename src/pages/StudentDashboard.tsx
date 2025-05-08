
import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import StudentInfoPanel from '@/components/StudentInfoPanel';
import StudentLocationMap from '@/components/StudentLocationMap';
import GuardianManager from '@/components/GuardianManager';
import { SharedLocationAlert } from '@/components/ui/shared-location-alert';
import { isMobileDevice } from '@/lib/utils/device-detection';
import { initializeMonitoring } from '@/lib/monitoring/service-monitor';
import PendingLocationsNotification from '@/components/student/PendingLocationsNotification';
import { useLocationSync } from '@/hooks/student/useLocationSync';
import { useLocationSharing } from '@/hooks/student/useLocationSharing';
import { useGuardianManagement } from '@/hooks/student/useGuardianManagement';
import { MobileAlertProps, useMobileAlert } from '@/hooks/student/useMobileAlert';
import PageTransition from '@/components/ui/page-transition';
import { Loader2 } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useUnifiedAuth();
  const navigate = useNavigate();
  
  // Estados para o alerta de compartilhamento (especialmente para mobile)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertDetails, setAlertDetails] = useState('');
  
  // Estado para controlar carregamento inicial
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Detectar dispositivo mobile
  const isMobile = isMobileDevice();
  
  // Inicializar monitoramento de serviços
  useEffect(() => {
    initializeMonitoring();
  }, []);

  // Get user information
  // @ts-ignore - Sabemos que o User do Supabase tem a propriedade user_metadata
  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  // @ts-ignore - Sabemos que o User do Supabase tem a propriedade user_metadata
  const userPhone = user?.user_metadata?.phone || 'Não informado';

  // Alert props for mobile
  const mobileAlertProps: MobileAlertProps = {
    setAlertOpen,
    setAlertSuccess,
    setAlertMessage,
    setAlertDetails
  };

  // Custom hooks for functionality
  const { hasPendingLocations, syncPendingLocations } = useLocationSync(user?.id);
  
  // Location sharing functionality
  const { 
    sharingStatus, 
    isSendingAll, 
    handleShareAll, 
    shareLocationToGuardian 
  } = useLocationSharing(userFullName, isMobile, mobileAlertProps);

  // Guardian management functionality
  const {
    guardians,
    isLoadingGuardians,
    error,
    fetchGuardians,
    handleAddGuardian,
    handleRemoveGuardian
  } = useGuardianManagement(user?.id);

  // Fetch guardians when user is available
  useEffect(() => {
    if (user?.id) {
      fetchGuardians(user.id);
    }
  }, [user?.id, fetchGuardians]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Finalizar inicialização após carregar dados essenciais
  useEffect(() => {
    if (user && !isLoadingGuardians) {
      // Atraso breve para garantir uma transição suave
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, isLoadingGuardians]);

  // Removi o componente de diagnóstico que já não é mais necessário

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-cy="dashboard-container" className="flex flex-col min-h-screen p-4">      
      <PendingLocationsNotification 
        hasPendingLocations={hasPendingLocations} 
        onSyncClick={syncPendingLocations} 
      />
      
      <PageTransition>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Student information panel */}
          <StudentInfoPanel 
            userFullName={userFullName} 
            email={user?.email} 
            phone={userPhone} 
          />

          {/* Location map */}
          <StudentLocationMap 
            onShareAll={() => handleShareAll(guardians)} 
            isSendingAll={isSendingAll} 
            guardianCount={guardians?.length || 0} 
          />
        </div>

        {/* Guardian management section */}
        <GuardianManager 
          guardians={guardians || []}
          isLoading={isLoadingGuardians}
          error={error}
          onAddGuardian={handleAddGuardian}
          onDeleteGuardian={handleRemoveGuardian}
          onShareLocation={(guardian) => shareLocationToGuardian(guardian)}
          sharingStatus={sharingStatus}
        />
      </PageTransition>
      
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

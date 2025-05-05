
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
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
import { MobileAlertProps } from '@/hooks/student/useMobileAlert';

const StudentDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Estados para o alerta de compartilhamento (especialmente para mobile)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertDetails, setAlertDetails] = useState('');
  
  // Detectar dispositivo mobile
  const isMobile = isMobileDevice();
  
  // Inicializar monitoramento de serviços
  useEffect(() => {
    initializeMonitoring();
  }, []);

  // Get user information
  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
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

  return (
    <div data-cy="dashboard-container" className="flex flex-col min-h-screen p-4">      
      <PendingLocationsNotification 
        hasPendingLocations={hasPendingLocations} 
        onSyncClick={syncPendingLocations} 
      />
      
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

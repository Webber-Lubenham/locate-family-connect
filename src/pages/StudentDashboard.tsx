
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import StudentInfoPanel from '@/components/StudentInfoPanel';
import StudentLocationMap from '@/components/StudentLocationMap';
import GuardianManager from '@/components/GuardianManager';
import { useLocationSharing } from '@/hooks/useLocationSharing';
import { useGuardianData } from '@/hooks/useGuardianData';

const StudentDashboard: React.FC = () => {
  const { user, profile } = useUser();
  const navigate = useNavigate();

  // Get user information
  const userFullName = user?.full_name || profile?.full_name || user?.email?.split('@')[0] || 'User';
  const userPhone = user?.phone || profile?.phone || 'Não informado';

  // Guardian data management
  const { 
    guardians, 
    isLoadingGuardians, 
    errorGuardians, 
    addGuardian, 
    deleteGuardian 
  } = useGuardianData(user?.id);

  // Location sharing functionality
  const { 
    sharingStatus, 
    isSendingAll, 
    shareLocation, 
    shareLocationAll 
  } = useLocationSharing(userFullName);

  // Handle share location to all guardians
  const handleShareAll = () => {
    shareLocationAll(guardians);
  };

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col min-h-screen p-4">
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
        error={errorGuardians}
        onAddGuardian={addGuardian}
        onDeleteGuardian={deleteGuardian}
        onShareLocation={shareLocation}
        sharingStatus={sharingStatus}
      />
    </div>
  );
};

export default StudentDashboard;

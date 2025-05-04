
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import StudentInfoPanel from '@/components/StudentInfoPanel';
import StudentLocationMap from '@/components/StudentLocationMap';
import GuardianManager from '@/components/GuardianManager';
import { useGuardianData } from '@/hooks/useGuardianData';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/auth';

const StudentDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);

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

  // Handle share location to all guardians
  const handleShareAll = async () => {
    setIsSendingAll(true);
    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Send to each guardian
      for (const guardian of guardians) {
        await shareLocationToGuardian(guardian, latitude, longitude);
      }
      
      setSharingStatus(prevStatus => {
        const newStatus: Record<string, string> = {};
        for (const guardian of guardians) {
          newStatus[guardian.id] = 'success';
        }
        return newStatus;
      });
    } catch (error: any) {
      console.error('Error sharing location to all:', error);
    } finally {
      setIsSendingAll(false);
    }
  };
  
  // Share location with a specific guardian
  const shareLocationToGuardian = async (guardian: GuardianData, latitude?: number, longitude?: number): Promise<void> => {
    setSharingStatus(prev => ({ ...prev, [guardian.id]: 'loading' }));
    
    try {
      if (!latitude || !longitude) {
        // Get current position if not provided
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          });
        });
        
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }
      
      const result = await apiService.shareLocation(
        guardian.email,
        latitude,
        longitude,
        userFullName
      );
      
      if (result) {
        setSharingStatus(prev => ({ ...prev, [guardian.id]: 'success' }));
      } else {
        throw new Error('Failed to share location');
      }
    } catch (error: any) {
      console.error('Error sharing location:', error);
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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
    </div>
  );
};

export default StudentDashboard;

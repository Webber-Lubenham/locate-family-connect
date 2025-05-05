import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import StudentInfoPanel from '@/components/StudentInfoPanel';
import StudentLocationMap from '@/components/StudentLocationMap';
import GuardianManager from '@/components/GuardianManager';
import { useGuardianData } from '@/hooks/useGuardianData';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';

const StudentDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      
      // Resumo final do compartilhamento (não depende de dispositivo)
      toast({
        title: "Compartilhamento concluído",
        description: successCount > 0 
          ? `Localização enviada com sucesso para ${successCount} responsável(is)${failCount > 0 ? ` (${failCount} falha(s))` : ''}` 
          : "Não foi possível compartilhar sua localização",
        variant: successCount > 0 ? "default" : "destructive",
        duration: 4000,
      });
      
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
      toast({
        title: "Erro ao obter localização",
        description: "Verifique se você deu permissão de localização ao navegador",
        variant: "destructive",
        duration: 4000,
      });
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
      
      if (result.success) {
        setSharingStatus(prev => ({ ...prev, [guardian.id]: 'success' }));
        
        // Exibe toast de sucesso em qualquer dispositivo
        toast({
          title: "Localização compartilhada",
          description: `Localização enviada com sucesso para ${guardian.full_name || guardian.email}`,
          variant: "default",
          duration: 3000,
        });
      } else {
        throw new Error(result.message || 'Falha ao compartilhar localização');
      }
    } catch (error: any) {
      console.error('Error sharing location:', error);
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
      
      // Exibe toast de erro em qualquer dispositivo
      toast({
        title: "Erro ao compartilhar",
        description: error?.message || "Não foi possível compartilhar sua localização",
        variant: "destructive",
        duration: 4000,
      });
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


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useLocationData } from '@/hooks/useLocationData';
import LocationHistoryList from '@/components/student/LocationHistoryList';
import StudentMapSection from '@/components/student/StudentMapSection';
import { useDeviceType } from '@/hooks/use-mobile';
import PageTransition from '@/components/ui/page-transition';
import 'mapbox-gl/dist/mapbox-gl.css';

const StudentMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(
    id || null
  );
  const [isPageReady, setIsPageReady] = useState<boolean>(false);
  
  // Fetch student details using our hook
  const { studentDetails, loading: isLoadingDetails } = useStudentDetails(
    selectedStudent, 
    user?.email
  );
  
  // Fetch location data using our hook
  const { locationData, loading: isLoadingLocations, error } = useLocationData(
    selectedStudent || user?.id,
    user?.email,
    user?.user_metadata?.user_type
  );

  // Determine map title based on context
  const getMapTitle = () => {
    if (selectedStudent && selectedStudent !== user?.id) {
      return `Localização do ${studentDetails?.name || 'Estudante'}`;
    }
    return 'Minha Localização';
  };

  // Calcula a altura adequada do mapa com base no tipo de dispositivo
  const getMapHeight = () => {
    switch(deviceType) {
      case 'mobile':
        return '45vh';
      case 'tablet':
        return '50vh';
      case 'laptop':
        return '60vh';
      default:
        return '70vh';
    }
  };
  
  // Calcula a altura mínima do mapa com base no tipo de dispositivo
  const getMinMapHeight = () => {
    switch(deviceType) {
      case 'mobile':
        return '250px';
      case 'tablet':
        return '300px';
      default:
        return '500px';
    }
  };
  
  // Verificar se os dados iniciais estão carregados
  useEffect(() => {
    if (!isLoadingDetails && !isLoadingLocations) {
      // Pequeno atraso para garantir transição suave
      const timer = setTimeout(() => {
        setIsPageReady(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingDetails, isLoadingLocations]);
  
  // Tela de carregamento enquanto os dados iniciais estão sendo buscados
  if (!isPageReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-lg text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-3 md:space-y-6 pb-16 md:pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1 md:gap-4">
          <div className="flex items-center gap-1 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="h-7 w-7 md:h-9 md:w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className={`${deviceType === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl'} font-bold tracking-tight`}>
                {getMapTitle()}
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                {selectedStudent && selectedStudent !== user?.id ? 
                  `Localização atual e histórico de ${studentDetails?.name || 'estudante'}` :
                  'Visualize e compartilhe sua localização atual'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main map component - altura ajustada para diferentes tipos de dispositivos */}
        <Card className="w-full" style={{ 
          height: getMapHeight(), 
          minHeight: getMinMapHeight() 
        }}>
          <StudentMapSection
            title={getMapTitle()}
            selectedUserId={selectedStudent || user?.id}
            showControls={!selectedStudent || selectedStudent === user?.id}
            locations={locationData}
            userType={user?.user_metadata?.user_type}
            studentDetails={studentDetails}
            senderName={user?.user_metadata?.full_name}
            loading={isLoadingLocations}
            noDataContent={
              <div className="text-center p-3">
                <p className="text-gray-500 text-sm">Nenhuma localização disponível</p>
              </div>
            }
          />
        </Card>

        {/* Location history */}
        <Card>
          <CardHeader className={`${deviceType === 'mobile' ? 'py-2 px-3' : 'py-3 px-4'}`}>
            <CardTitle className={`${deviceType === 'mobile' ? 'text-sm' : 'text-base md:text-lg'}`}>
              Histórico de Localizações
            </CardTitle>
          </CardHeader>
          <CardContent className={`${deviceType === 'mobile' ? 'px-2 py-1' : 'px-3 py-2 md:p-4'}`}>
            <LocationHistoryList
              locationData={locationData}
              loading={isLoadingLocations}
              error={error}
              userType={user?.user_metadata?.user_type}
              studentDetails={studentDetails}
              senderName={user?.user_metadata?.full_name}
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default StudentMap;

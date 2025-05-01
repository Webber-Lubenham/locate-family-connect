
import React, { useEffect, useState } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MapView from '@/components/MapView';
import { LocationData } from '@/types/database';
import LocationRequestButton from './LocationRequestButton';
import { useDeviceType } from '@/hooks/use-mobile';

interface StudentMapSectionProps {
  title: string;
  selectedUserId?: string;
  showControls: boolean;
  locations: LocationData[];
  userType?: string;
  noDataContent?: React.ReactNode;
  studentDetails?: { name: string; email: string } | null;
  senderName?: string;
  loading?: boolean;
}

const StudentMapSection: React.FC<StudentMapSectionProps> = ({
  title,
  selectedUserId,
  showControls,
  locations,
  userType,
  noDataContent,
  studentDetails,
  senderName,
  loading
}) => {
  const deviceType = useDeviceType();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );
  
  // Atualiza a orientação quando o usuário gira o dispositivo
  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const showRequestButton = userType === 'parent' && 
                           locations.length === 0 && 
                           !loading && 
                           studentDetails?.email;

  // Ajusta a altura do mapa baseado no tipo de dispositivo e orientação
  const getMapHeight = () => {
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? 'calc(100% - 36px)' : 'calc(100% - 44px)';
    } else if (deviceType === 'tablet') {
      return orientation === 'landscape' ? 'calc(100% - 40px)' : 'calc(100% - 46px)';
    }
    return 'calc(100% - 48px)';
  };
  
  // Ajusta a altura mínima do mapa baseado no tipo de dispositivo e orientação
  const getMinHeight = () => {
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? '180px' : '220px';
    } else if (deviceType === 'tablet') {
      return orientation === 'landscape' ? '240px' : '280px';
    }
    return '400px';
  };
  
  // Ajusta o tamanho da fonte do título baseado no tipo de dispositivo e orientação
  const getTitleClass = () => {
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? 'text-xs font-medium' : 'text-sm font-medium';
    } else if (deviceType === 'tablet') {
      return orientation === 'landscape' ? 'text-sm font-medium' : 'text-base font-medium';
    }
    return 'text-base md:text-lg';
  };
  
  // Ajusta o padding do cabeçalho baseado no tipo de dispositivo e orientação
  const getHeaderPadding = () => {
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? 'p-1 pb-0.5' : 'p-2 pb-1';
    }
    return 'p-2 md:p-4';
  };

  return (
    <>
      <CardHeader className={getHeaderPadding()}>
        <CardTitle className={getTitleClass()}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative" style={{ 
        height: getMapHeight(), 
        minHeight: getMinHeight() 
      }}>
        <MapView 
          selectedUserId={selectedUserId} 
          showControls={showControls}
          locations={locations} 
        />
        
        {/* Show request button for parents when no location data */}
        {showRequestButton && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 md:p-5 rounded-lg shadow-lg z-10 text-center w-[85%] max-w-xs">
            <h3 className={`${deviceType === 'mobile' ? 'text-xs' : 'text-sm'} md:text-lg font-medium mb-1 md:mb-2`}>
              Nenhuma localização disponível
            </h3>
            <p className={`${deviceType === 'mobile' ? 'text-[0.65rem]' : 'text-xs'} md:text-sm text-gray-600 mb-2 md:mb-4`}>
              {studentDetails?.name || 'O estudante'} ainda não compartilhou sua localização.
            </p>
            <LocationRequestButton 
              studentEmail={studentDetails.email}
              studentName={studentDetails.name}
              senderName={senderName || 'Responsável'}
            />
          </div>
        )}
        
        {noDataContent && locations.length === 0 && !showRequestButton && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 md:p-5 rounded-lg shadow-lg z-10 text-center w-[85%] max-w-xs">
            {noDataContent}
          </div>
        )}
      </CardContent>
    </>
  );
};

export default StudentMapSection;

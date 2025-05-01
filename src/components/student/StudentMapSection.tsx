
import React from 'react';
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
  const showRequestButton = userType === 'parent' && 
                           locations.length === 0 && 
                           !loading && 
                           studentDetails?.email;

  // Ajusta a altura do mapa baseado no tipo de dispositivo
  const getMapHeight = () => {
    switch(deviceType) {
      case 'mobile':
        return 'calc(100% - 44px)';
      case 'tablet':
        return 'calc(100% - 46px)';
      default:
        return 'calc(100% - 48px)';
    }
  };
  
  // Ajusta a altura mínima do mapa baseado no tipo de dispositivo
  const getMinHeight = () => {
    switch(deviceType) {
      case 'mobile':
        return '220px';
      case 'tablet':
        return '280px';
      default:
        return '400px';
    }
  };
  
  // Ajusta o tamanho da fonte do título baseado no tipo de dispositivo
  const getTitleClass = () => {
    switch(deviceType) {
      case 'mobile':
        return 'text-sm font-medium';
      case 'tablet':
        return 'text-base font-medium';
      default:
        return 'text-base md:text-lg';
    }
  };

  return (
    <>
      <CardHeader className={`p-2 md:p-4 ${deviceType === 'mobile' ? 'pb-1' : ''}`}>
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
            <h3 className="text-sm md:text-lg font-medium mb-1 md:mb-2">Nenhuma localização disponível</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4">
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

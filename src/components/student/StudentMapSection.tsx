
import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MapView from '@/components/MapView';
import { LocationData } from '@/types/database';
import LocationRequestButton from './LocationRequestButton';

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
  const showRequestButton = userType === 'parent' && 
                           locations.length === 0 && 
                           !loading && 
                           studentDetails?.email;

  return (
    <>
      <CardHeader className="p-4">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MapView 
          selectedUserId={selectedUserId} 
          showControls={showControls}
          locations={locations} 
        />
        
        {/* Show request button for parents when no location data */}
        {showRequestButton && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg z-10 text-center w-80">
            <h3 className="text-lg font-medium mb-2">Nenhuma localização disponível</h3>
            <p className="text-gray-600 mb-4">
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg z-10 text-center">
            {noDataContent}
          </div>
        )}
      </CardContent>
    </>
  );
};

export default StudentMapSection;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationData } from '@/types/database';
import MapView from '@/components/map/MapView';
import { Loader2, AlertCircle } from 'lucide-react';

interface StudentMapSectionProps {
  title?: string;
  selectedUserId?: string;
  locations: LocationData[];
  loading: boolean;
  error?: string | null;
  showControls?: boolean;
  userType?: 'student' | 'parent' | 'teacher';
  studentDetails?: { 
    name: string;
    email: string;
  } | null;
  senderName?: string;
  noDataContent?: React.ReactNode;
}

const StudentMapSection: React.FC<StudentMapSectionProps> = ({
  title = "Localização",
  selectedUserId,
  locations = [],
  loading = false,
  error = null,
  showControls = true,
  userType = "parent",
  studentDetails,
  senderName,
  noDataContent
}) => {
  console.log('StudentMapSection props:', {
    title,
    selectedUserId,
    locations,
    loading,
    error,
    showControls,
    userType,
    studentDetails,
    senderName,
    noDataContent
  });

  console.log('StudentMapSection locations:', locations);

  return (
    <Card className="w-full" data-cy="student-map-section">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        {error ? (
          <div className="flex items-center justify-center p-12 text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        ) : locations.length === 0 && !loading ? (
          <div data-cy="map-container" className="h-[400px]">
            {noDataContent || (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground" data-cy="no-locations-message">
                <p>Nenhuma localização encontrada</p>
                {userType === 'parent' && studentDetails && (
                  <p className="text-sm mt-2">
                    {studentDetails.name} ainda não compartilhou sua localização.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[400px]" data-cy="map-container">
            <MapView
              selectedUserId={selectedUserId}
              locations={locations}
              showControls={showControls}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StudentMapSection;

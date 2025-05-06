
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationData } from '@/types/database';
import MapView from '@/components/map/MapView';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';
import PageTransition from '../ui/page-transition';

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
  // Estado local para forçar o foco na localização mais recente
  const [focusTimestamp, setFocusTimestamp] = useState<number>(Date.now());
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState<boolean>(false);
  
  // Efeito para forçar o foco na localização mais recente quando as localizações são carregadas
  useEffect(() => {
    if (locations && locations.length > 0) {
      // Atualizar o timestamp para forçar o componente MapView a reagir
      setFocusTimestamp(Date.now());
      setHasInitiallyLoaded(true);
    }
  }, [locations]);
  
  console.log('StudentMapSection props:', {
    title,
    selectedUserId,
    locationsCount: locations?.length || 0,
    loading,
    error,
    showControls,
    userType,
    studentDetails,
    focusTimestamp
  });

  return (
    <Card className="w-full" data-cy="student-map-section">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            <span>{title}</span>
          </div>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <PageTransition transitionKey={`map-${selectedUserId}-${locations.length}-${loading}-${error}`}>
          {error ? (
            <div className="flex items-center justify-center p-12 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          ) : locations.length === 0 && !loading ? (
            <div data-cy="map-container" className="h-[400px]">
              {noDataContent || (
                <div className="flex flex-col items-center justify-center h-full p-12 text-muted-foreground" data-cy="no-locations-message">
                  <MapPin className="h-12 w-12 mb-2 text-muted-foreground/50" />
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
                forceUpdateKey={focusTimestamp}
                focusOnLatest={hasInitiallyLoaded} // Focar apenas após o primeiro carregamento
              />
            </div>
          )}
        </PageTransition>
      </CardContent>
    </Card>
  );
}

export default StudentMapSection;

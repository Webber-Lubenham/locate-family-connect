
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useLocationData } from '@/hooks/useLocationData';
import LocationHistoryList from '@/components/student/LocationHistoryList';
import StudentMapSection from '@/components/student/StudentMapSection';
import 'mapbox-gl/dist/mapbox-gl.css';

const StudentMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(
    id || null
  );
  
  // Fetch student details using our hook
  const { studentDetails } = useStudentDetails(
    selectedStudent, 
    user?.email
  );
  
  // Fetch location data using our hook
  const { locationData, loading, error } = useLocationData(
    selectedStudent || user?.id,
    user?.email,
    user?.user_type
  );

  // Determine map title based on context
  const getMapTitle = () => {
    if (selectedStudent && selectedStudent !== user?.id) {
      return `Localização do ${studentDetails?.name || 'Estudante'}`;
    }
    return 'Minha Localização';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mapa de Localização</h1>
            <p className="text-gray-500">
              Visualize e compartilhe sua localização atual
            </p>
          </div>
        </div>
      </div>

      {/* Main map component */}
      <Card className="w-full" style={{ height: '70vh', minHeight: '500px' }}>
        <StudentMapSection
          title={getMapTitle()}
          selectedUserId={selectedStudent || user?.id}
          showControls={!selectedStudent || selectedStudent === user?.id}
          locations={locationData}
          userType={user?.user_type}
          studentDetails={studentDetails}
          senderName={user?.full_name}
          loading={loading}
          noDataContent={
            <div className="text-center">
              <p className="text-gray-500">Nenhuma localização disponível</p>
            </div>
          }
        />
      </Card>

      {/* Location history */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Localizações</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationHistoryList
            locationData={locationData}
            loading={loading}
            error={error}
            userType={user?.user_type}
            studentDetails={studentDetails}
            senderName={user?.full_name}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMap;

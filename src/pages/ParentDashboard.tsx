import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import StudentsListContainer from '../components/student/StudentsListContainer';
import { InviteStudentForm } from '../components/student/InviteStudentForm';
import StudentMapSection from '../components/student/StudentMapSection';
import LocationHistoryList from '../components/student/LocationHistoryList';
import { Button } from '../components/ui/button';
import { PlusCircle, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { useEffect } from 'react';
import { LocationData } from '@/types/database';
import { locationService } from '@/lib/services/location/LocationService';
import { useToast } from '@/components/ui/use-toast';
import { Student, StudentWithProfiles } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

function ParentDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(false);
  const { user, signOut } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  useEffect(() => {
    if (selectedStudent) {
      loadStudentLocations(selectedStudent.id);
    }
  }, [selectedStudent]);

  const loadStudentLocations = async (studentId: string) => {
    try {
      setIsLoadingLocations(true);
      setLocationError(null);
      console.log('ParentDashboard: Carregando localizações para estudante ID:', studentId);
      
      // Call the service with 'parent' userType to use the correct function
      const data = await locationService.getStudentLocations(studentId, 'parent');
      
      console.log('ParentDashboard: Localizações carregadas:', data?.length || 0);
      setLocations(data);
      
      if (data.length === 0) {
        setLocationError('Nenhuma localização encontrada para este estudante');
        toast({
          description: "Este estudante ainda não compartilhou nenhuma localização",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar localizações:', error);
      setLocationError('Não foi possível carregar as localizações do estudante');
      toast({
        variant: "destructive",
        title: "Erro ao carregar localizações",
        description: "Não foi possível obter as localizações do estudante.",
      });
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    // Reset locations when selecting a different student
    setLocations([]);
    setLocationError(null);
  };

  return (
    <div data-cy="dashboard-container" className="container mx-auto px-4 py-8 relative">
      {/* Botão de Logout */}
      <button
        onClick={signOut}
        className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        data-cy="logout-button"
      >
        Logout
      </button>
      
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-600">
          <User className="h-5 w-5" />
          <span className="font-medium">
            {user?.user_metadata?.full_name || user?.email || 'Responsável'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard do Responsável</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Estudante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Estudante</DialogTitle>
              </DialogHeader>
              <InviteStudentForm onStudentAdded={() => {}} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Estudantes */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <StudentsListContainer
              onSelectStudent={handleSelectStudent}
              selectedStudent={selectedStudent}
            />
          </CardContent>
        </Card>

        {/* Mapa e Histórico */}
        <Card className="lg:col-span-2">
          <CardContent>
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="map" className="flex-1">Mapa</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="map">
                <StudentMapSection
                  title={`Localização de ${selectedStudent?.name || 'Estudante'}`}
                  selectedUserId={selectedStudent?.id}
                  showControls={true}
                  locations={locations}
                  userType="parent"
                  studentDetails={selectedStudent ? {
                    name: selectedStudent.name,
                    email: selectedStudent.email
                  } : null}
                  loading={isLoadingLocations}
                />
              </TabsContent>

              <TabsContent value="history">
                <LocationHistoryList
                  locationData={locations}
                  loading={isLoadingLocations}
                  error={locationError}
                  userType="parent"
                  studentDetails={selectedStudent ? {
                    name: selectedStudent.name,
                    email: selectedStudent.email
                  } : null}
                  senderName={user?.user_metadata?.full_name}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ParentDashboard;

import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { InviteStudentForm } from '../components/student/InviteStudentForm';
import { StudentsList } from '../components/student/StudentsList';
import StudentMapSection from '../components/student/StudentMapSection';
import LocationHistoryList from '../components/student/LocationHistoryList';
import { Button } from '../components/ui/button';
import { PlusCircle, User, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { useEffect } from 'react';
import { LocationData } from '@/types/database';
import { studentService } from '@/lib/services/studentService';
import { useToast } from '@/components/ui/use-toast';

interface Student {
  student_id: string;
  status: string;
  user_profiles: {
    name: string;
    email: string;
  };
}

function ParentDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentLocations(selectedStudent.student_id);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      setError(null);
      const data = await studentService.getStudentsByParent(user!.id);
      setStudents(data);
      if (data.length > 0) {
        setSelectedStudent(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
      setError('Não foi possível carregar a lista de estudantes. Tente novamente mais tarde.');
      toast({
        variant: "destructive",
        title: "Erro ao carregar estudantes",
        description: "Ocorreu um erro ao carregar seus estudantes vinculados.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentLocations = async (studentId: string) => {
    try {
      setLocationError(null);
      const data = await studentService.getStudentLocations(studentId);
      setLocations(data);
    } catch (error) {
      console.error('Erro ao carregar localizações:', error);
      setLocationError('Não foi possível carregar as localizações do estudante');
      toast({
        variant: "destructive",
        title: "Erro ao carregar localizações",
        description: "Não foi possível obter as localizações do estudante.",
      });
    }
  };

  return (
    <div data-cy="dashboard-container" className="container mx-auto px-4 py-8">
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
              <InviteStudentForm onSuccess={loadStudents} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error ? (
        <Card className="p-6 border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Estudantes */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <StudentsList
                students={students}
                loading={loading}
                onSelectStudent={setSelectedStudent}
                selectedStudent={selectedStudent}
                onStudentUpdated={loadStudents}
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
                    title={`Localização de ${selectedStudent?.user_profiles.name || 'Estudante'}`}
                    selectedUserId={selectedStudent?.student_id}
                    showControls={true}
                    locations={locations}
                    userType="parent"
                    studentDetails={selectedStudent?.user_profiles}
                    loading={loading}
                  />
                </TabsContent>

                <TabsContent value="history">
                  <LocationHistoryList
                    locationData={locations}
                    loading={loading}
                    error={locationError}
                    userType="parent"
                    studentDetails={selectedStudent?.user_profiles}
                    senderName={user?.user_metadata?.full_name}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;

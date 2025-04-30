import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapView from '@/components/MapView';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LocationData } from '@/types/database';
import { ArrowLeft, SendIcon, RefreshCw } from 'lucide-react';
import { apiService } from '@/lib/api/api-service';

const StudentMap = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(
    id || null
  );
  const [studentDetails, setStudentDetails] = useState<{name: string, email: string} | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  
  // Fetch student details using our improved apiService
  useEffect(() => {
    if (selectedStudent && user?.user_type === 'parent') {
      const fetchStudentDetails = async () => {
        console.log('[DEBUG] Fetching student details for:', selectedStudent);
        
        const response = await apiService.getStudentDetails(selectedStudent);
        
        if (response.success && response.data) {
          setStudentDetails(response.data);
          console.log('[DEBUG] Student details retrieved:', response.data);
        } else {
          console.error('[DEBUG] Error fetching student details:', response.error || 'No data found');
          // Set a default name if we couldn't fetch the details
          setStudentDetails({
            name: 'Estudante',
            email: ''
          });
        }
      };
      
      fetchStudentDetails();
    }
  }, [selectedStudent, user?.user_type]);

  // Fetch location data for the selected student or the current user
  useEffect(() => {
    async function fetchLocation() {
      try {
        setLoading(true);
        setError(null);

        // Determine which user_id to use
        const targetUserId = selectedStudent || user?.id;

        if (!targetUserId) {
          setError('Nenhum usuário selecionado ou autenticado');
          setLoading(false);
          return;
        }

        console.log('[DEBUG] StudentMap - Fetching locations for:', targetUserId);
        
        let data;
        let locationError = null;
        
        if (user?.user_type === 'parent' && targetUserId !== user.id) {
          // Parent viewing student location - use the secure function
          console.log('[DEBUG] StudentMap - Parent viewing student location, using get_student_locations function');
          
          // Check if we have user email
          if (!user.email) {
            console.error('[DEBUG] StudentMap - Missing user email for parent');
            setError('Dados de usuário incompletos. Por favor, faça login novamente.');
            setLoading(false);
            return;
          }
          
          // Use the get_student_locations function
          const result = await supabase.client.rpc('get_student_locations', {
            p_guardian_email: user.email,
            p_student_id: targetUserId
          });
          
          console.log('[DEBUG] StudentMap - RPC result:', result);
          data = result.data;
          locationError = result.error;
          
          // Handle empty result as no data instead of error
          if (!data || data.length === 0) {
            console.log('[DEBUG] StudentMap - No data available');
            data = [];
          }
        } else {
          // Student viewing own location - direct query
          console.log('[DEBUG] StudentMap - Student viewing own location, using direct query');
            
          // Direct query with the UUID
          const result = await supabase.client
            .from('locations')
            .select(`
              id, 
              user_id, 
              latitude, 
              longitude, 
              timestamp,
              address
            `)
            .eq('user_id', targetUserId)
            .order('timestamp', { ascending: false })
            .limit(10);
          
          console.log('[DEBUG] StudentMap - Direct query result:', result);
          data = result.data;
          locationError = result.error;
        }

        if (locationError) {
          console.error('[DEBUG] StudentMap - Error fetching location:', locationError);
          setError(`Erro ao buscar dados de localização: ${locationError.message}`);
          setLoading(false);
          return;
        }

        // Normalize data structure
        const normalizedData = data ? data.map((item: any) => ({
          ...item,
          timestamp: item.timestamp || item.location_timestamp || new Date().toISOString(),
          user: {
            full_name: item.student_name || studentDetails?.name || 'Estudante',
            user_type: 'student'
          }
        })) : [];

        console.log('[DEBUG] StudentMap - Normalized location data:', normalizedData);

        setLocationData(normalizedData as LocationData[]);
        
        if (normalizedData.length === 0) {
          console.log('[DEBUG] StudentMap - No location data found');
        }
      } catch (err) {
        console.error('[DEBUG] StudentMap - Unexpected error:', err);
        setError('Ocorreu um erro inesperado ao buscar dados de localização');
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, [selectedStudent, user?.id, user?.email, user?.user_type, studentDetails]);

  // Request location from student
  const requestLocationUpdate = async () => {
    if (!studentDetails?.email) {
      toast({
        title: "Erro",
        description: "Email do estudante não disponível",
        variant: "destructive"
      });
      return;
    }

    setSendingRequest(true);
    
    try {
      toast({
        title: "Enviando solicitação...",
        description: "Estamos solicitando a atualização de localização",
      });

      // Use email service to send request
      const success = await apiService.shareLocation(
        studentDetails.email,
        0, // placeholder
        0, // placeholder
        user?.full_name || 'Responsável',
        true // isRequest flag
      );

      if (success) {
        toast({
          title: "Solicitação enviada",
          description: `Solicitação de localização enviada para ${studentDetails.name}`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível enviar a solicitação",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('[DEBUG] Error requesting location:', err);
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao solicitar a localização",
        variant: "destructive"
      });
    } finally {
      setSendingRequest(false);
    }
  };

  // Share location via email to guardians
  const shareLocationViaEmail = async (locationId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para compartilhar sua localização",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Enviando email...",
      description: "Estamos enviando sua localização por email para seus responsáveis",
    });

    try {
      const { error } = await supabase.client.functions.invoke('share-location', {
        body: { locationId }
      });

      if (error) {
        console.error('Error sharing location:', error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar o email com sua localização",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Email com sua localização enviado para seus responsáveis",
      });
    } catch (err) {
      console.error('Error invoking function:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar enviar o email",
        variant: "destructive"
      });
    }
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
      <Card className="w-full h-[70vh]">
        <CardHeader className="p-4">
          <CardTitle>
            {selectedStudent && selectedStudent !== user?.id ? 
              `Localização do ${studentDetails?.name || 'Estudante'}` : 
              'Minha Localização'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MapView 
            selectedUserId={selectedStudent || user?.id} 
            showControls={!selectedStudent || selectedStudent === user?.id}
            locations={locationData} 
          />
          
          {/* Show request button for parents when no location data */}
          {user?.user_type === 'parent' && locationData.length === 0 && !loading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg z-10 text-center w-80">
              <h3 className="text-lg font-medium mb-2">Nenhuma localização disponível</h3>
              <p className="text-gray-600 mb-4">
                {studentDetails?.name || 'O estudante'} ainda não compartilhou sua localização.
              </p>
              <Button 
                onClick={requestLocationUpdate}
                disabled={sendingRequest}
                className="w-full"
              >
                {sendingRequest ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  <><SendIcon className="mr-2 h-4 w-4" /> Solicitar Localização</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location history */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Localizações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          ) : locationData.length === 0 ? (
            <div>
              <p className="text-center text-gray-500 py-4">
                Nenhum histórico de localização encontrado
              </p>
              {user?.user_type === 'parent' && studentDetails && (
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Solicite que {studentDetails.name} compartilhe sua localização atual.
                  </p>
                  <Button
                    variant="outline"
                    onClick={requestLocationUpdate}
                    disabled={sendingRequest}
                    size="sm"
                  >
                    {sendingRequest ? "Enviando..." : "Solicitar Atualização"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {locationData.map((location) => (
                <div
                  key={location.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <div className="font-medium">
                      {location.user?.full_name || 'Usuário Desconhecido'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(location.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Lat: {location.latitude.toFixed(6)}, Long:{' '}
                      {location.longitude.toFixed(6)}
                    </div>
                  </div>
                  {user?.user_type === 'student' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareLocationViaEmail(location.id)}
                    >
                      Enviar por Email
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMap;

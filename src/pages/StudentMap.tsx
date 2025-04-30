import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapView from '@/components/MapView';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LocationData } from '@/types/database';
import { ArrowLeft } from 'lucide-react';

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
          // Parent viewing student location - use the new secure function
          console.log('[DEBUG] StudentMap - Parent viewing student location, using new get_student_locations function');
          
          // Check if we have user email
          if (!user.email) {
            console.error('[DEBUG] StudentMap - Missing user email for parent');
            setError('Dados de usuário incompletos. Por favor, faça login novamente.');
            setLoading(false);
            return;
          }
          
          // Use the new improved function
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
            full_name: item.student_name || 'Desconhecido',
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
        setError('Ocorreu um erro inesperado ao buscar dados de localiza��ão');
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, [selectedStudent, user?.id, user?.email, user?.user_type]);

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
            {selectedStudent && selectedStudent !== user?.id ? 'Localização do Estudante' : 'Minha Localização'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MapView 
            selectedUserId={selectedStudent || user?.id} 
            showControls={!selectedStudent || selectedStudent === user?.id}
            locations={locationData} 
          />
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
            <p className="text-center text-gray-500 py-4">
              Nenhum histórico de localização encontrado
            </p>
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

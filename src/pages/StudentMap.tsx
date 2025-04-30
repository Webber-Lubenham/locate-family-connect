
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MapView from '@/components/MapView';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export interface LocationData {
  id: string;
  user_id: number; // Ajustado para number para corresponder ao banco de dados
  latitude: number;
  longitude: number;
  timestamp: string;
  user?: {
    full_name: string;
    user_type: string;
  } | null;
}

const StudentMap = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const { toast } = useToast();
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

        // Convert string userId to number for database query
        const numericUserId = Number(targetUserId);

        // Query the database for location data
        const { data, error: locationError } = await supabase.client
          .from('locations')
          .select(`
            id, 
            user_id, 
            latitude, 
            longitude, 
            timestamp
          `)
          .eq('user_id', numericUserId)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (locationError) {
          console.error('Error fetching location:', locationError);
          setError(`Erro ao buscar dados de localização: ${locationError.message}`);
          setLoading(false);
          return;
        }

        // For each location, fetch the associated user data
        if (data) {
          const enhancedData = await Promise.all(
            data.map(async (item) => {
              try {
                // Use the user_id as is for type safety
                const userId = item.user_id;
                
                // Fetch user profile
                const { data: userData, error: userError } = await supabase.client
                  .from('profiles')
                  .select('full_name, user_type')
                  .eq('user_id', userId)
                  .single();

                return {
                  ...item,
                  user: userError ? null : {
                    full_name: userData?.full_name || 'Unknown',
                    user_type: userData?.user_type || 'student'
                  }
                };
              } catch (err) {
                console.error('Error fetching user profile:', err);
                return {
                  ...item,
                  user: null
                };
              }
            })
          );

          // Convertemos explicitamente para o tipo LocationData[]
          setLocationData(enhancedData as LocationData[]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Ocorreu um erro inesperado ao buscar dados de localização');
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, [selectedStudent, user?.id]);

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mapa de Localização</h1>
          <p className="text-gray-500">
            Visualize e compartilhe sua localização atual
          </p>
        </div>
      </div>

      {/* Main map component */}
      <Card className="w-full h-[70vh]">
        <CardHeader className="p-4">
          <CardTitle>
            {selectedStudent ? 'Localização do Estudante' : 'Minha Localização'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MapView selectedUserId={selectedStudent || user?.id} showControls={!selectedStudent} />
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareLocationViaEmail(location.id)}
                  >
                    Enviar por Email
                  </Button>
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

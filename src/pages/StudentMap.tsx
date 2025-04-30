import React, { useState, useEffect } from "react";
import MapView from "@/components/MapView";
import { supabase } from "@/lib/supabase";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Share2, RefreshCw, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/lib/api/api-service";
import { useUser } from "@/contexts/UserContext";
import { clearAppCache, hasApiErrors } from "@/lib/utils/cache-manager";
import ApiErrorBanner from "@/components/ApiErrorBanner";

const StudentMap = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const studentId = params.id;
  const studentNameFromState = location.state?.studentName || "";
  const { profile, user } = useUser();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const isParent = profile?.user_type === 'parent' || user?.user_metadata?.user_type === 'parent' || user?.user_type === 'parent';

  console.log(`[MAP] StudentMap rendered, studentId: ${studentId || 'self'}`);
  
  // Redirecionar para o dashboard se não houver ID válido
  useEffect(() => {
    if (!studentId || studentId === 'undefined') {
      console.log('[MAP] Invalid student ID, redirecting to dashboard');
      navigate(isParent ? '/parent-dashboard' : '/student-dashboard');
    }
  }, [studentId, navigate, isParent]);

  useEffect(() => {
    // Check if there are any API errors
    setHasErrors(hasApiErrors());
  }, []);

  // Estados para dados reais
  const [locations, setLocations] = useState<Array<{
    id: string;
    user_id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    user?: {
      full_name?: string;
      role?: string;
    };
  }>>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [safeZones, setSafeZones] = useState<Array<{
    id: string;
    user_id: string;
    name?: string;
    radius?: number;
    latitude: number;
    longitude: number;
  }>>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [studentName, setStudentName] = useState<string>(studentNameFromState);
  const [loadingStudentData, setLoadingStudentData] = useState(true);

  // Buscar informações do estudante
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!studentId || studentId === 'undefined') {
        setLoadingStudentData(false);
        return;
      }
      
      // Se já temos o nome do state, não é necessário buscar do banco
      if (studentNameFromState) {
        setStudentName(studentNameFromState);
        setLoadingStudentData(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.client
          .from('profiles')
          .select('full_name')
          .eq('user_id', studentId)
          .single();
        
        if (error) {
          console.error("Erro ao buscar perfil do estudante:", error);
        } else if (data) {
          setStudentName(data.full_name);
        }
      } catch (err) {
        console.error("Erro ao buscar informações do estudante:", err);
      } finally {
        setLoadingStudentData(false);
      }
    };
    
    fetchStudentProfile();
  }, [studentId, studentNameFromState]);

  // Obter localização atual do usuário
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.error("Erro ao obter localização:", error);
          }
        );
      }
    };
    
    getUserLocation();
  }, []);

  // Buscar localizações reais do Supabase
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        // Validar studentId antes de fazer a consulta
        if (!studentId || studentId === 'undefined') {
          console.log('[MAP] Skipping location fetch - invalid student ID');
          setLocations([]);
          setShowUserLocation(true); // Mostrar localização do usuário quando não há dados
          setLoadingLocations(false);
          return;
        }
        
        // Verifica se o ID é UUID (string) ou número
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
        
        try {
          const { data: initialData, error: initialError } = await supabase.client
            .from('locations')
            .select('id, user_id, latitude, longitude, timestamp, user:user_id(full_name, role)')
            .eq('user_id', studentId)
            .order('timestamp', { ascending: false });
            
          if (initialError) {
            console.error("Erro na consulta principal:", initialError);
            throw initialError;
          }
          
          let processedData = initialData || [];
          
          if (!initialData || initialData.length === 0) {
            // Tenta buscar usando o profile.id do estudante se o UUID não funcionou
            if (isUuid) {
              const { data: profileData, error: profileError } = await supabase.client
                .from('profiles')
                .select('id')
                .eq('user_id', studentId)
                .single();
                
              if (!profileError && profileData) {
                const { data: locationData, error: locationError } = await supabase.client
                  .from('locations')
                  .select('id, user_id, latitude, longitude, timestamp')
                  .eq('user_id', profileData.id)
                  .order('timestamp', { ascending: false });
                  
                if (!locationError && locationData && locationData.length > 0) {
                  // Adicionar campos de usuário aos dados de localização
                  processedData = locationData.map(loc => ({
                    ...loc,
                    user: {
                      full_name: '',
                      role: ''
                    }
                  }));
                  console.log('[MAP] Encontradas localizações usando ID de perfil:', processedData.length);
                }
              }
            }
          }
          
          // Se ainda não encontrou dados, usar a localização atual do usuário
          if (processedData.length === 0) {
            setShowUserLocation(true);
            console.log('[MAP] Nenhuma localização encontrada. Mostrando localização do usuário.');
          } else {
            setLocations(processedData);
            console.log('[MAP] Localizações carregadas:', processedData.length);
          }
        } catch (fetchError) {
          console.error('[MAP] Erro ao buscar localizações:', fetchError);
          setShowUserLocation(true); // Em caso de erro, mostre a localização do usuário
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setLocations([]);
        setShowUserLocation(true); // Em caso de erro, mostre a localização do usuário
      } finally {
        setLoadingLocations(false);
      }
    };
    
    fetchLocations();
  }, [studentId]);

  // Buscar zonas seguras do Supabase
  useEffect(() => {
    const fetchZones = async () => {
      setLoadingZones(true);
      try {
        // A tabela 'safe_zones' ainda não existe no banco de dados
        // Por enquanto, apenas definimos um array vazio
        console.log('[MAP] A tabela safe_zones ainda não está disponível no banco de dados');
        setSafeZones([]);
        
        // Código comentado para referência futura quando a tabela existir
        /*
        // Validar studentId antes de fazer a consulta
        if (!studentId || studentId === 'undefined') {
          console.log('[MAP] Skipping safe zones fetch - invalid student ID');
          setSafeZones([]);
          setLoadingZones(false);
          return;
        }
        
        // Verifica se o ID é UUID (string) ou número
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
        
        try {
          const { data: initialData, error: initialError } = await supabase.client
            .from('safe_zones')
            .select('*')
            .eq('user_id', studentId);
            
          if (initialError) {
            console.error("Erro na consulta de zonas seguras:", initialError);
            throw initialError;
          }
          
          let processedData = initialData || [];
          
          if ((initialData === null || initialData.length === 0) && isUuid) {
            // Tenta buscar usando o profile.id se o UUID não funcionou
            const { data: profileData, error: profileError } = await supabase.client
              .from('profiles')
              .select('id')
              .eq('user_id', studentId)
              .single();
              
            if (!profileError && profileData) {
              const { data: zonesData, error: zonesError } = await supabase.client
                .from('safe_zones')
                .select('*')
                .eq('user_id', profileData.id);
                
              if (!zonesError && zonesData) {
                processedData = zonesData;
                console.log('[MAP] Encontradas zonas seguras usando ID de perfil:', processedData.length);
              }
            }
          }
          
          setSafeZones(processedData);
        } catch (fetchError) {
          console.error('[MAP] Erro ao buscar zonas seguras:', fetchError);
          setSafeZones([]);
        }
        */
      } catch (err) {
        console.error('Error fetching safe zones:', err);
        setSafeZones([]);
      } finally {
        setLoadingZones(false);
      }
    };
    
    fetchZones();
  }, []);

  const handleShareLocation = async () => {
    if (!profile) {
      console.error('[MAP] Cannot share location: no profile data');
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar sua localização.",
        variant: "destructive"
      });
      return;
    }

    console.log('[MAP] Getting current location');
    setIsSharing(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      console.log('[MAP] Current location:', position.coords);
      
      const { latitude, longitude } = position.coords;

      // Call the shareLocation function directly on apiService
      await apiService.shareLocation(
        'parent@example.com', // Normally would be the email of the responsible party
        latitude,
        longitude,
        profile.full_name || 'Estudante'
      );

      console.log('[MAP] Location shared successfully');
    } catch (error) {
      console.error('[MAP] Error sharing location:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar sua localização. Verifique se você permitiu o acesso à sua localização.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <ApiErrorBanner />

      <div className="space-y-4">
        {/* Botão de voltar */}
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(isParent ? '/parent-dashboard' : '/student-dashboard')} 
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <h1 className="text-3xl font-bold">
          {loadingStudentData 
            ? "Mapa de Localização" 
            : studentName 
              ? `Mapa de Localização - ${studentName}` 
              : "Mapa de Localização"
          }
        </h1>
        <p className="text-muted-foreground">
          Visualize sua localização atual e histórico de trajetos
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button 
            onClick={handleShareLocation} 
            disabled={isSharing}
            className="flex items-center"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? "Compartilhando..." : "Compartilhar Localização Atual"}
          </Button>
          
          {hasErrors && (
            <Button
              variant="outline"
              onClick={() => clearAppCache(true)}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar Cache
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Mapa</h3>
        {/* Mapa real com dados do Supabase */}
        <div className="w-full h-[50vh]">
          <React.Suspense fallback={<div>Carregando mapa...</div>}>
            {studentId && (
              <MapView studentId={studentId} userLocation={showUserLocation ? userCoordinates : null} />
            )}
          </React.Suspense>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Histórico de Localizações</h3>
          <div className="space-y-2">
            {loadingLocations ? (
              <div>Carregando histórico...</div>
            ) : locations.length === 0 ? (
              <div className="text-muted-foreground">Nenhum histórico encontrado</div>
            ) : (
              locations.map((loc, idx) => (
                <div key={loc.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Localização #{locations.length - idx}</p>
                    <p className="text-sm text-muted-foreground">{new Date(loc.timestamp).toLocaleString()}</p>
                  </div>
                  {idx === 0 && <Badge>Atual</Badge>}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Zonas Seguras</h3>
          <div className="space-y-2">
            {loadingZones ? (
              <div>Carregando zonas seguras...</div>
            ) : (
              <div className="text-muted-foreground">A tabela de zonas seguras ainda não está disponível no banco de dados.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentMap;

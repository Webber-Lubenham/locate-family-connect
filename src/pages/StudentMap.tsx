
import React, { useState, useEffect } from "react";
import MapView from "@/components/MapView";
import { supabase } from "@/lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Share2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/lib/api/api-service";
import { useUser } from "@/contexts/UserContext";
import { clearAppCache, hasApiErrors } from "@/lib/utils/cache-manager";
import ApiErrorBanner from "@/components/ApiErrorBanner";

const StudentMap = () => {
  const navigate = useNavigate();
  const params = useParams();
  const studentId = params.id;
  const { profile } = useUser();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  console.log(`[MAP] StudentMap rendered, studentId: ${studentId || 'self'}`);

  useEffect(() => {
    // Check if there are any API errors
    setHasErrors(hasApiErrors());
  }, []);

  // Estados para dados reais
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [safeZones, setSafeZones] = useState<any[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  // Buscar localizações reais do Supabase
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
          .from('locations')
          .select('id, user_id, latitude, longitude, timestamp, user:user_id(full_name, role)')
          .eq('user_id', studentId)
          .order('timestamp', { ascending: false });
        if (error) throw error;
        setLocations(data || []);
      } catch (err) {
        setLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };
    if (studentId) fetchLocations();
  }, [studentId]);

  // Buscar zonas seguras do Supabase
  useEffect(() => {
    const fetchZones = async () => {
      setLoadingZones(true);
      try {
        const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
          .from('safe_zones')
          .select('*')
          .eq('user_id', studentId);
        if (error) throw error;
        setSafeZones(data || []);
      } catch (err) {
        setSafeZones([]);
      } finally {
        setLoadingZones(false);
      }
    };
    if (studentId) fetchZones();
  }, [studentId]);

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
    <div className="space-y-6">
      <ApiErrorBanner />

      <div className="mb-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium border border-gray-300 mb-2"
        >
          ← Voltar
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Mapa de Localização</h1>
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
            {/* @ts-ignore - MapView pode não ter tipagem default para lazy */}
            {studentId && (
              <MapView studentId={studentId as string} />
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
            ) : safeZones.length === 0 ? (
              <div className="text-muted-foreground">Nenhuma zona segura cadastrada</div>
            ) : (
              safeZones.map(zone => (
                <div key={zone.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{zone.name || 'Zona'}</p>
                    <p className="text-sm text-muted-foreground">Raio: {zone.radius || '--'}</p>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentMap;

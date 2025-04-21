
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/lib/api/api-service";
import { useUser } from "@/contexts/UserContext";

const StudentMap = () => {
  const params = useParams();
  const studentId = params.id;
  const { profile } = useUser();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  console.log(`[MAP] StudentMap rendered, studentId: ${studentId || 'self'}`);

  // Mock data for demonstration
  const studentLocations = [
    { id: 1, name: "Escola", time: "Hoje, 13:45", current: true },
    { id: 2, name: "Casa", time: "Hoje, 08:15", current: false },
    { id: 3, name: "Biblioteca", time: "Ontem, 16:30", current: false }
  ];

  const safeZones = [
    { id: 1, name: "Casa", radius: "100m", active: true },
    { id: 2, name: "Escola", radius: "200m", active: true },
    { id: 3, name: "Casa da Avó", radius: "100m", active: true }
  ];

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

      // Exemplificando uma chamada para a função edge share-location
      await apiService.location.shareLocation({
        email: 'parent@example.com', // Normalmente seria o email do responsável
        latitude,
        longitude,
        studentName: profile.full_name || 'Estudante'
      });

      console.log('[MAP] Location shared successfully');
      toast({
        title: "Localização compartilhada",
        description: "Sua localização foi compartilhada com sucesso.",
      });
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
      <div>
        <h1 className="text-3xl font-bold">Mapa de Localização</h1>
        <p className="text-muted-foreground">
          Visualize sua localização atual e histórico de trajetos
        </p>
        <div className="mt-4">
          <Button 
            onClick={handleShareLocation} 
            disabled={isSharing}
            className="flex items-center"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? "Compartilhando..." : "Compartilhar Localização Atual"}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Mapa</h3>
        <div id="map" className="aspect-video bg-slate-100 rounded-md flex flex-col items-center justify-center p-6">
          <MapPin className="h-16 w-16 text-blue-500 mb-4" />
          <p className="text-slate-500 text-center">
            O componente de mapa será integrado aqui. <br/>
            <span className="text-sm">Clique em "Compartilhar Localização Atual" para testar a API</span>
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Histórico de Localizações</h3>
          <div className="space-y-2">
            {studentLocations.map(location => (
              <div key={location.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-sm text-muted-foreground">{location.time}</p>
                </div>
                {location.current && <Badge>Atual</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Zonas Seguras</h3>
          <div className="space-y-2">
            {safeZones.map(zone => (
              <div key={zone.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{zone.name}</p>
                  <p className="text-sm text-muted-foreground">Raio: {zone.radius}</p>
                </div>
                <Badge variant="outline">Ativo</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentMap;

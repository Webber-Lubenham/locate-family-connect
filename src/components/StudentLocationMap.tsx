
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { useToast } from '@/components/ui/use-toast';
import MapContainer from './map/MapContainer';

// Garantir que o token do Mapbox seja definido globalmente
if (!mapboxgl.accessToken) {
  mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
  console.log('MapBox Token (StudentLocationMap):', mapboxgl.accessToken);
}

interface StudentLocationMapProps {
  onShareAll: () => void;
  isSendingAll: boolean;
  guardianCount: number;
}

const StudentLocationMap: React.FC<StudentLocationMapProps> = ({ 
  onShareAll, 
  isSendingAll, 
  guardianCount 
}) => {
  const { 
    mapContainer, 
    mapError, 
    handleUpdateLocation, 
    mapInitialized,
    loading,
    currentPosition
  } = useMapInitialization();
  
  const { toast } = useToast();

  // Efeito para verificar se a localização foi carregada
  useEffect(() => {
    if (currentPosition) {
      const { latitude, longitude } = currentPosition.coords;
      console.log(`[StudentLocationMap] Localização atual carregada: ${latitude}, ${longitude}`);
    }
  }, [currentPosition]);
  
  // Add debug function to check mapbox status
  const checkMapboxStatus = () => {
    console.log('Checking Mapbox status:');
    console.log('- Token:', mapboxgl.accessToken);
    console.log('- Container reference:', mapContainer.current);
    console.log('- Current position:', currentPosition?.coords);
    
    if (mapContainer.current) {
      const style = window.getComputedStyle(mapContainer.current);
      console.log('- Container dimensions:', style.width, style.height);
    }
    
    toast({
      title: "Mapbox Debug",
      description: `Token: ${mapboxgl.accessToken?.substring(0, 10)}... | Localização: ${currentPosition ? 'Disponível' : 'Indisponível'}`,
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Minha Localização</CardTitle>
        <CardDescription>
          Visualize sua localização no mapa
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <MapContainer>
          <div 
            ref={mapContainer} 
            className="w-full h-full"
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#f0f0f0' 
            }}
          />
          
          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[300px]">
            {/* Status da localização atual (se disponível) */}
            {currentPosition && (
              <div className="bg-white/90 p-2 rounded-md text-xs shadow-md mb-1">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">Localização atual disponível</span>
                </div>
                <div className="text-gray-600 mt-1 truncate">
                  {new Date().toLocaleString()}
                </div>
              </div>
            )}
            
            <Button
              onClick={handleUpdateLocation}
              disabled={loading}
              variant="secondary"
              className="bg-white/90 hover:bg-white shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obtendo localização...
                </>
              ) : (
                currentPosition ? "Atualizar Localização" : "Obter Minha Localização"
              )}
            </Button>
            
            {guardianCount > 0 && (
              <Button
                onClick={onShareAll}
                disabled={isSendingAll || !currentPosition}
                variant={currentPosition ? "default" : "secondary"}
                className={`${currentPosition ? "bg-blue-600 hover:bg-blue-700" : "bg-white/90 hover:bg-white"} shadow-md`}
              >
                {isSendingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  `Enviar Localização para ${guardianCount} Responsável(is)`
                )}
              </Button>
            )}
          </div>
          
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <p className="text-red-500">{mapError}</p>
            </div>
          )}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default StudentLocationMap;

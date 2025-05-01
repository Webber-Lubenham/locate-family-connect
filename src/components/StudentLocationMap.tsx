import React from 'react';
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
  const { mapContainer, mapError, handleUpdateLocation, mapInitialized } = useMapInitialization();
  const { toast } = useToast();
  
  // Add debug function to check mapbox status
  const checkMapboxStatus = () => {
    console.log('Checking Mapbox status:');
    console.log('- Token:', mapboxgl.accessToken);
    console.log('- Container reference:', mapContainer.current);
    
    if (mapContainer.current) {
      const style = window.getComputedStyle(mapContainer.current);
      console.log('- Container dimensions:', style.width, style.height);
    }
    
    toast({
      title: "Mapbox Debug",
      description: `Token: ${mapboxgl.accessToken?.substring(0, 10)}...`,
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
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
            <Button
              onClick={handleUpdateLocation}
              variant="secondary"
              className="bg-white/90 hover:bg-white"
            >
              Atualizar Localização
            </Button>
            
            {guardianCount > 0 && (
              <Button
                onClick={onShareAll}
                disabled={isSendingAll}
                variant="secondary"
                className="bg-white/90 hover:bg-white"
              >
                {isSendingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  `Enviar Localização para Todos (${guardianCount})`
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

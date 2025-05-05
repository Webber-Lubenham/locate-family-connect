
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { useToast } from '@/components/ui/use-toast';
import MapContainer from './map/MapContainer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    mapInstance,
    mapError, 
    handleUpdateLocation, 
    mapInitialized,
    loading: locationLoading,
    currentPosition
  } = useMapInitialization();
  
  const { toast } = useToast();
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateInterval, setUpdateInterval] = useState<number>(60); // seconds
  const [updateCountdown, setUpdateCountdown] = useState<number>(60);

  // Função para formatar a hora da última atualização
  const getFormattedUpdateTime = useCallback(() => {
    if (!lastUpdateTime) return 'Nunca atualizado';
    
    return format(lastUpdateTime, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  }, [lastUpdateTime]);

  // Atualizar a localização automaticamente ao montar o componente
  useEffect(() => {
    if (mapInitialized && !currentPosition && !locationLoading) {
      console.log('[StudentLocationMap] Obtendo localização inicial automática');
      handleUpdateLocation();
    }
  }, [mapInitialized, currentPosition, locationLoading, handleUpdateLocation]);

  // Efeito para atualização periódica da localização
  useEffect(() => {
    let timer: number | null = null;
    let countdownTimer: number | null = null;
    
    if (autoUpdateEnabled && mapInitialized) {
      // Timer para atualizar a localização
      timer = window.setInterval(() => {
        console.log('[StudentLocationMap] Atualizando localização automaticamente');
        handleUpdateLocation();
        setUpdateCountdown(updateInterval);
      }, updateInterval * 1000);
      
      // Timer para atualizar o contador regressivo
      countdownTimer = window.setInterval(() => {
        setUpdateCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    
    // Limpar os timers quando o componente for desmontado
    return () => {
      if (timer) window.clearInterval(timer);
      if (countdownTimer) window.clearInterval(countdownTimer);
    };
  }, [autoUpdateEnabled, mapInitialized, updateInterval, handleUpdateLocation]);

  // Atualizar o timestamp da última atualização quando a posição mudar
  useEffect(() => {
    if (currentPosition) {
      setLastUpdateTime(new Date());
      setUpdateCountdown(updateInterval);
    }
  }, [currentPosition, updateInterval]);

  // Toggle para ativar/desativar a atualização automática
  const toggleAutoUpdate = () => {
    const newState = !autoUpdateEnabled;
    setAutoUpdateEnabled(newState);
    
    toast({
      title: newState ? "Atualização automática ativada" : "Atualização automática desativada",
      description: newState 
        ? `Sua localização será atualizada a cada ${updateInterval} segundos` 
        : "A atualização da sua localização foi pausada",
      variant: newState ? "default" : "secondary",
      duration: 3000,
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Minha Localização</span>
          {locationLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Visualize sua localização atual e compartilhe com seus responsáveis
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
          
          {/* Status panel overlay */}
          <div className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-md shadow-md text-xs">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <div className="flex items-center">
                  {currentPosition ? (
                    <span className="flex items-center text-green-600">
                      <MapPin className="h-3 w-3 mr-1" /> Localizado
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600">
                      <MapPin className="h-3 w-3 mr-1" /> Não localizado
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Atualização:</span>
                <span className="flex items-center">
                  {autoUpdateEnabled ? (
                    <span className="flex items-center text-green-600">
                      <Wifi className="h-3 w-3 mr-1" /> Automática
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-600">
                      <WifiOff className="h-3 w-3 mr-1" /> Manual
                    </span>
                  )}
                </span>
              </div>
              {lastUpdateTime && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Última:</span>
                  <span className="flex items-center text-gray-600">
                    <Clock className="h-3 w-3 mr-1" /> {getFormattedUpdateTime()}
                  </span>
                </div>
              )}
              {autoUpdateEnabled && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Próxima em:</span>
                  <span className="text-gray-600">{updateCountdown}s</span>
                </div>
              )}
            </div>
          </div>
          
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
                  Lat: {currentPosition.coords.latitude.toFixed(6)}, Lon: {currentPosition.coords.longitude.toFixed(6)}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateLocation}
                disabled={locationLoading}
                variant="secondary"
                className="bg-white/90 hover:bg-white shadow-md flex-1"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Obtendo...
                  </>
                ) : (
                  "Atualizar Agora"
                )}
              </Button>
              
              <Button
                onClick={toggleAutoUpdate}
                variant="outline"
                className={`${autoUpdateEnabled ? 'bg-green-50' : 'bg-gray-50'} shadow-md min-w-[45px]`}
                title={autoUpdateEnabled ? "Desativar atualização automática" : "Ativar atualização automática"}
              >
                {autoUpdateEnabled ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              </Button>
            </div>
            
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
              <p className="text-red-500 p-4 bg-white/90 rounded shadow-lg">{mapError}</p>
            </div>
          )}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default StudentLocationMap;

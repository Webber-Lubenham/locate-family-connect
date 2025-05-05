import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Share } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { env } from '@/env';
import { useDeviceType } from '@/hooks/use-mobile';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token do Mapbox
const MAPBOX_TOKEN = env.MAPBOX_TOKEN;
const MAP_STYLE = env.MAPBOX_STYLE_URL;
const DEFAULT_CENTER = env.MAPBOX_CENTER.split(',').map(Number);
const DEFAULT_ZOOM = parseInt(env.MAPBOX_ZOOM);

interface StudentLocationMapProps {
  onShareAll: () => Promise<void>;
  isSendingAll: boolean;
  guardianCount: number;
}

const StudentLocationMap: React.FC<StudentLocationMapProps> = ({
  onShareAll,
  isSendingAll,
  guardianCount
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [autoUpdateActive, setAutoUpdateActive] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const { toast } = useToast();
  const deviceType = useDeviceType();
  
  // Funções para obter formatação de acordo com dispositivo
  const getMapHeight = () => {
    if (deviceType === 'mobile') {
      return 'h-[250px]';
    } else if (deviceType === 'tablet') {
      return 'h-[300px]';
    }
    return 'h-[350px]';
  };

  const getButtonSize = () => {
    if (deviceType === 'mobile') {
      return 'btn-sm py-1 px-2 text-xs';
    }
    return '';
  };
  
  const getStatusIndicatorSize = () => {
    if (deviceType === 'mobile') {
      return 'text-xs p-1';
    }
    return 'text-sm p-2'; 
  };

  // Inicialização do mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Criando o mapa com opções otimizadas para mobile
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: deviceType === 'mobile' ? DEFAULT_ZOOM + 2 : DEFAULT_ZOOM,
      attributionControl: false,
      cooperativeGestures: deviceType === 'mobile' || deviceType === 'tablet', // Evita conflito com gestos de scroll
      fadeDuration: 100, // Animação mais rápida em dispositivos móveis
      minZoom: 2,
      maxZoom: 18
    });

    // Adicionando controles de navegação otimizados para touch
    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true,
      visualizePitch: false
    }), 'bottom-right');

    // Handler para quando o mapa estiver pronto
    map.current.on('load', () => {
      console.log('Map loaded successfully');
      setMapLoaded(true);
      
      // Iniciar obtenção da localização assim que o mapa estiver carregado
      handleUpdateLocation();
      
      // Iniciar atualizações automáticas
      startAutoUpdate();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Função para iniciar atualizações automáticas
  const startAutoUpdate = () => {
    setAutoUpdateActive(true);
    const intervalId = setInterval(() => {
      handleUpdateLocation();
    }, 60000); // Atualiza a cada 60 segundos
    
    // Armazenando o ID do intervalo para limpar depois
    return () => {
      clearInterval(intervalId);
      setAutoUpdateActive(false);
    };
  };

  // Toggle para ativar/desativar atualizações automáticas
  const toggleAutoUpdate = () => {
    if (autoUpdateActive) {
      setAutoUpdateActive(false);
      toast({
        title: "Localização automática desativada",
        description: "As atualizações automáticas foram pausadas",
        variant: "default"
      });
    } else {
      startAutoUpdate();
      handleUpdateLocation();
      toast({
        title: "Localização automática ativada",
        description: "Sua localização será atualizada a cada minuto",
        variant: "default"
      });
    }
  };

  // Atualizar a localização atual
  const handleUpdateLocation = async () => {
    if (!map.current || !mapLoaded) return;
    
    setIsLoadingLocation(true);
    
    try {
      // Obtendo a posição atual
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });
      
      // Atualizando timestamp da última atualização
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setLastUpdateTime(timeString);
      
      // Atualizando a visualização do mapa
      const newCenter = [longitude, latitude];
      map.current.flyTo({
        center: newCenter,
        zoom: deviceType === 'mobile' ? 15 : 14,
        speed: 1.5,
        curve: 1.2,
        essential: true
      });
      
      // Removendo marcador anterior se existir
      const existingMarker = document.getElementById('current-location-marker');
      if (existingMarker) {
        existingMarker.remove();
      }
      
      // Criando um elemento personalizado para o marcador
      const markerEl = document.createElement('div');
      markerEl.id = 'current-location-marker';
      markerEl.className = 'custom-marker';
      markerEl.style.width = '20px';
      markerEl.style.height = '20px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.backgroundColor = '#4a90e2';
      markerEl.style.border = '3px solid white';
      markerEl.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      markerEl.style.cursor = 'pointer';
      
      // Adicionando o marcador
      new mapboxgl.Marker(markerEl)
        .setLngLat([longitude, latitude])
        .addTo(map.current);
      
      // Adicionando atributo data com a posição atual (para uso pelo StudentDashboard)
      const mapElement = mapContainer.current;
      if (mapElement) {
        mapElement.setAttribute('data-map-instance', 'true');
        mapElement.setAttribute('data-position', JSON.stringify({ latitude, longitude }));
      }
      
      toast({
        title: "Localização atualizada",
        description: `${new Date().toLocaleTimeString()}`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast({
        title: "Erro ao obter localização",
        description: error.message || "Verifique se você permitiu acesso à sua localização",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Status indicator */}
          <div className={`flex items-center justify-between bg-slate-100 p-2 ${getStatusIndicatorSize()}`}>
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full ${autoUpdateActive ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></div>
              <span className="text-gray-700">
                {autoUpdateActive ? 'Atualização automática ativa' : 'Atualização manual'}
              </span>
            </div>
            {lastUpdateTime && (
              <span className="text-gray-500 text-xs">
                Última atualização: {lastUpdateTime}
              </span>
            )}
          </div>
          
          {/* Map container */}
          <div 
            ref={mapContainer} 
            className={`w-full ${getMapHeight()} relative`} 
          />
          
          {/* Controls */}
          <div className="flex flex-wrap p-3 gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button
                size={deviceType === 'mobile' ? 'sm' : 'default'}
                variant="outline"
                onClick={handleUpdateLocation}
                disabled={isLoadingLocation}
                className={`px-2 py-1 h-auto ${deviceType === 'mobile' ? 'text-xs' : ''}`}
              >
                {isLoadingLocation ? (
                  <><RefreshCw className="mr-1 h-3 w-3 md:h-4 md:w-4 animate-spin" /> Atualizando...</>
                ) : (
                  <><RefreshCw className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Atualizar Localização</>
                )}
              </Button>
              
              <Button
                size={deviceType === 'mobile' ? 'sm' : 'default'}
                variant={autoUpdateActive ? "default" : "outline"}
                onClick={toggleAutoUpdate}
                className={`px-2 py-1 h-auto ${deviceType === 'mobile' ? 'text-xs' : ''}`}
              >
                {autoUpdateActive ? "Pausar Auto" : "Ativar Auto"}
              </Button>
            </div>
            
            <Button
              size={deviceType === 'mobile' ? 'sm' : 'default'}
              onClick={onShareAll}
              disabled={isSendingAll || guardianCount === 0}
              className={`px-2 py-1 h-auto ${deviceType === 'mobile' ? 'text-xs' : ''}`}
            >
              {isSendingAll ? (
                <><RefreshCw className="mr-1 h-3 w-3 md:h-4 md:w-4 animate-spin" /> Enviando...</>
              ) : (
                <><Share className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Compartilhar com {guardianCount} responsável{guardianCount !== 1 ? 'is' : ''}</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentLocationMap;

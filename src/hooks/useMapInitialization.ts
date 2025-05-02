
import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { env } from '@/env';
import { useToast } from '@/components/ui/use-toast';

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapInitializationResult {
  mapContainer: React.RefObject<HTMLDivElement>;
  map: React.RefObject<mapboxgl.Map | null>;
  mapInitialized: boolean;
  mapError: string | null;
  viewport: MapViewport;
  updateViewport: (viewport: Partial<MapViewport>) => void;
  handleUpdateLocation: () => void;
  isTokenValid: boolean;
}

export function useMapInitialization(): MapInitializationResult {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { toast } = useToast();
  
  const [viewport, setViewport] = useState<MapViewport>({
    latitude: Number(env.MAPBOX_CENTER?.split(',')[0] || -23.5489),
    longitude: Number(env.MAPBOX_CENTER?.split(',')[1] || -46.6388),
    zoom: Number(env.MAPBOX_ZOOM || 12)
  });

  const updateViewport = (newViewport: Partial<MapViewport>) => {
    setViewport(prev => ({ ...prev, ...newViewport }));
  };

  // Check if Mapbox token is valid
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      const token = env.MAPBOX_TOKEN;
      if (!token) {
        setMapError('API token para Mapbox não configurado');
        setIsTokenValid(false);
        return;
      }
      mapboxgl.accessToken = token;
    }
  }, []);

  // Handle location update
  const handleUpdateLocation = () => {
    if (!mapContainer.current || !map.current) return;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true
          });
          
          updateViewport({
            latitude,
            longitude,
            zoom: 15
          });
          
          // Add or update user location marker
          const el = document.createElement('div');
          el.className = 'pulse-marker';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#3b82f6';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
          
          new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
          
          toast({
            title: "Localização atualizada",
            description: "Sua localização foi atualizada com sucesso."
          });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          toast({
            title: "Erro",
            description: `Não foi possível obter sua localização: ${error.message}`,
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
    }
  };

  return {
    mapContainer,
    map,
    mapInitialized,
    mapError,
    viewport,
    updateViewport,
    handleUpdateLocation,
    isTokenValid
  };
}

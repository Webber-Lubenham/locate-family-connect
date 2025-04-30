
import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { useToast } from '@/components/ui/use-toast';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

// Garantir que o token do Mapbox seja definido globalmente
if (!mapboxgl.accessToken) {
  mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
  console.log('MapBox Token (useMapInitialization):', mapboxgl.accessToken);
}

export const useMapInitialization = (initialViewport: MapViewport = {
  latitude: -23.5489, // Default to São Paulo coordinates
  longitude: -46.6388,
  zoom: 12
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const [mapInitialized, setMapInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Mapbox
    const initializeMap = () => {
      if (!mapContainer.current || map.current) return;
      
      try {
        // Verificar se token está configurado
        if (!mapboxgl.accessToken) {
          mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
        }

        if (!mapboxgl.accessToken) {
          console.error('MapBox Token não está configurado.');
          setMapError('Token do Mapbox não está configurado.');
          return;
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
          center: [viewport.longitude, viewport.latitude],
          zoom: viewport.zoom,
          attributionControl: false
        });

        // Adiciona controle de atribuição
        map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
        
        // Adiciona controle de escala
        const scale = new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' });
        map.current.addControl(scale, 'bottom-right');

        // Add navigation control
        const nav = new mapboxgl.NavigationControl();
        map.current.addControl(nav, 'top-right');

        // Add user marker when map is loaded
        map.current.once('load', () => {
          setMapInitialized(true);
          console.log('Map initialized successfully in useMapInitialization hook');
          
          // Add marker
          if (map.current) {
            new mapboxgl.Marker({
              color: '#0080ff'
            })
            .setLngLat([viewport.longitude, viewport.latitude])
            .addTo(map.current);
          }
          
          toast({
            title: "Mapa carregado",
            description: "Mapa inicializado com sucesso",
            variant: "default"
          });
        });

        // Log errors
        map.current.on('error', (e) => {
          console.error('MapBox Error in hook:', e.error);
          setMapError('Erro ao carregar o mapa.');
          toast({
            title: "Erro no mapa",
            description: `Erro ao carregar o mapa: ${e.error.message}`,
            variant: "destructive"
          });
        });

      } catch (error: any) {
        console.error('Error initializing map in hook:', error);
        setMapError('Não foi possível inicializar o mapa.');
        toast({
          title: "Erro no mapa",
          description: `Falha na inicialização: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive"
        });
      }
    };

    // Try to get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewport({
            latitude,
            longitude,
            zoom: 15
          });
          
          // Update map center if map is already initialized
          if (map.current && mapInitialized) {
            map.current.setCenter([longitude, latitude]);
            
            // Clear existing markers
            const markers = document.getElementsByClassName('mapboxgl-marker');
            while(markers[0]) {
              markers[0].parentNode?.removeChild(markers[0]);
            }
            
            // Update marker position
            new mapboxgl.Marker({ color: '#0080ff' })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
        },
        (error) => {
          console.error('Erro ao obter localização inicial:', error);
          // Continue with default coordinates
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout
          maximumAge: 0
        }
      );
    }

    // Initialize map after setting coordinates
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [toast]);

  const handleUpdateLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewport({
            latitude,
            longitude,
            zoom: 15
          });
          if (map.current) {
            map.current.setCenter([longitude, latitude]);
            
            // Clear existing markers
            const markers = document.getElementsByClassName('mapboxgl-marker');
            while(markers[0]) {
              markers[0].parentNode?.removeChild(markers[0]);
            }
            
            // Add new marker
            new mapboxgl.Marker({ color: '#0080ff' })
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
              
            toast({
              title: "Localização atualizada",
              description: `Nova posição: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              variant: "default"
            });
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setMapError('Não foi possível obter a localização.');
          toast({
            title: "Erro de localização",
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
      setMapError('Geolocalização não suportada neste navegador.');
      toast({
        title: "Recurso não suportado",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
    }
  };

  return {
    mapContainer,
    mapError,
    viewport,
    handleUpdateLocation,
    mapInitialized
  };
};

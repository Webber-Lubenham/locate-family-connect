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
  mapboxgl.accessToken = env.MAPBOX_TOKEN || '';
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
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        // Verificar se token está configurado
        if (!mapboxgl.accessToken) {
          console.error('MapBox Token não está configurado.');
          setMapError('Token do Mapbox não está configurado.');
          return;
        }

        // Ensure container is empty
        while (mapContainer.current.firstChild) {
          mapContainer.current.removeChild(mapContainer.current.firstChild);
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
          center: [viewport.longitude, viewport.latitude],
          zoom: viewport.zoom,
          attributionControl: false,
          preserveDrawingBuffer: true
        });

        // Add essential controls
        map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true
          })
        );

        // Add marker when map is loaded
        map.current.once('load', () => {
          setMapInitialized(true);
          console.log('Map initialized successfully in useMapInitialization hook');

          if (map.current) {
            new mapboxgl.Marker({
              color: '#0080ff'
            })
              .setLngLat([viewport.longitude, viewport.latitude])
              .addTo(map.current);
          }
        });

        // Handle errors
        map.current.on('error', (e) => {
          console.error('MapBox Error:', e.error);
          setMapError('Erro ao carregar o mapa.');
          toast({
            title: "Erro no mapa",
            description: `Erro ao carregar o mapa: ${e.error.message}`,
            variant: "destructive"
          });
        });

      } catch (error: any) {
        console.error('Error initializing map:', error);
        setMapError('Não foi possível inicializar o mapa.');
        toast({
          title: "Erro no mapa",
          description: `Falha na inicialização: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive"
        });
      }
    };

    // Initialize map
    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [viewport.latitude, viewport.longitude, viewport.zoom, toast]);

  const handleUpdateLocation = () => {
    if (!('geolocation' in navigator)) {
      setMapError('Geolocalização não suportada neste navegador.');
      toast({
        title: "Recurso não suportado",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewport({
          latitude,
          longitude,
          zoom: 15
        });

        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 2000
          });

          // Update marker
          const markers = document.getElementsByClassName('mapboxgl-marker');
          while (markers[0]) {
            markers[0].parentNode?.removeChild(markers[0]);
          }

          new mapboxgl.Marker({ color: '#0080ff' })
            .setLngLat([longitude, latitude])
            .addTo(map.current);

          toast({
            title: "Localização atualizada",
            description: "Sua localização foi atualizada com sucesso",
            variant: "default"
          });
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        setMapError('Não foi possível obter sua localização.');
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
  };

  return {
    mapContainer,
    mapError,
    viewport,
    handleUpdateLocation,
    mapInitialized
  };
};

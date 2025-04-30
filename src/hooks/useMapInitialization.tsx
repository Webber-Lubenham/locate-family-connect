
import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

// Garantir que o token do Mapbox seja definido globalmente
mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';

export const useMapInitialization = (initialViewport: MapViewport = {
  latitude: -23.5489, // Default to São Paulo coordinates
  longitude: -46.6388,
  zoom: 12
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);

  useEffect(() => {
    // Initialize Mapbox
    const initializeMap = () => {
      if (mapContainer.current && !map.current) {
        try {
          // Verificar se token está configurado
          if (!mapboxgl.accessToken) {
            console.error('MapBox Token não está configurado.');
            setMapError('Token do Mapbox não está configurado.');
            return;
          }

          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
            center: [viewport.longitude, viewport.latitude],
            zoom: viewport.zoom
          });

          // Adiciona controle de escala
          const scale = new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' });
          map.current.addControl(scale, 'bottom-right');

          // Adiciona controle de fullscreen
          const fullscreen = new mapboxgl.FullscreenControl();
          map.current.addControl(fullscreen, 'top-left');

          // Add navigation control
          const nav = new mapboxgl.NavigationControl();
          map.current.addControl(nav, 'top-right');

          // Add user marker
          new mapboxgl.Marker({
            color: '#0080ff'
          })
          .setLngLat([viewport.longitude, viewport.latitude])
          .addTo(map.current);

          // Log success
          map.current.on('load', () => {
            console.log('Map initialized successfully in useMapInitialization hook');
          });

          // Log errors
          map.current.on('error', (e) => {
            console.error('MapBox Error in hook:', e.error);
            setMapError('Erro ao carregar o mapa.');
          });

        } catch (error) {
          console.error('Error initializing map in hook:', error);
          setMapError('Não foi possível inicializar o mapa.');
        }
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
          if (map.current) {
            map.current.setCenter([longitude, latitude]);
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
  }, []);

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
            // Atualiza marcador
            new mapboxgl.Marker({ color: '#0080ff' })
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
          }
        },
        (error) => {
          setMapError('Não foi possível obter a localização.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setMapError('Geolocalização não suportada neste navegador.');
    }
  };

  return {
    mapContainer,
    mapError,
    viewport,
    handleUpdateLocation
  };
};

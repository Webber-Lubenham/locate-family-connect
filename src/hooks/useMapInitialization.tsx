
import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { useToast } from '@/components/ui/use-toast';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

// Default viewport centered on São Paulo
const DEFAULT_VIEWPORT: MapViewport = {
  latitude: -23.5489,
  longitude: -46.6388,
  zoom: 12
};

// Initialize Mapbox token only once at module level
if (!mapboxgl.accessToken && env.MAPBOX_TOKEN) {
  mapboxgl.accessToken = env.MAPBOX_TOKEN;
  console.log('MapBox Token initialized');
}

export const useMapInitialization = (initialViewport: MapViewport = DEFAULT_VIEWPORT) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [accuracyCircle, setAccuracyCircle] = useState<mapboxgl.GeoJSONSource | null>(null);

  // Verify token on mount
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      const error = 'Token do Mapbox não está configurado';
      console.error(error);
      setMapError(error);
    }
  }, []);

  // Inicializar o mapa quando o componente for montado
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxgl.accessToken) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [viewport.longitude, viewport.latitude],
        zoom: viewport.zoom,
      });
      
      map.current.on('load', () => {
        console.log('[MapInit] Map loaded successfully');
        setMapInitialized(true);
        
        // Adicionar fonte e camada para o círculo de precisão
        if (map.current) {
          map.current.addSource('accuracy-circle', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [viewport.longitude, viewport.latitude]
              },
              properties: {
                radius: 0
              }
            }
          });
          
          map.current.addLayer({
            id: 'accuracy-circle',
            type: 'circle',
            source: 'accuracy-circle',
            paint: {
              'circle-radius': ['get', 'radius'],
              'circle-color': '#3b82f6',
              'circle-opacity': 0.15,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#3b82f6',
              'circle-stroke-opacity': 0.3
            }
          });
          
          setAccuracyCircle(map.current.getSource('accuracy-circle') as mapboxgl.GeoJSONSource);
        }
      });
      
      // Adicionar controles de navegação ao mapa
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('[MapInit] Failed to initialize map:', error);
      setMapError('Falha ao inicializar o mapa. Verifique suas permissões.');
    }
    
    return () => {
      if (marker.current) marker.current.remove();
      if (map.current) map.current.remove();
      map.current = null;
      marker.current = null;
    };
  }, [viewport]);
  
  // Função para obter a localização atual com alta precisão
  const getCurrentLocation = useCallback(() => {
    // Se já estiver carregando, não inicie outra solicitação
    if (loading) {
      console.log('[MapInit] Já existe uma solicitação de localização em andamento');
      return;
    }
    
    setLoading(true);
    setMapError(null);
    
    if (!navigator.geolocation) {
      setMapError('Geolocalização não é suportada em seu navegador');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`[MapInit] Current location: ${latitude}, ${longitude}, accuracy: ${accuracy}m`);
        
        setCurrentPosition(position);
        updateViewport({ latitude, longitude, zoom: 16 });
        
        // Atualizar o mapa para a nova localização
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            essential: true,
            speed: 1.5
          });
          
          // Adicionar ou atualizar marcador
          if (marker.current) {
            marker.current.setLngLat([longitude, latitude]);
          } else {
            // Criar um elemento personalizado para o marcador
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.backgroundColor = '#3b82f6';
            el.style.border = '2px solid white';
            el.style.borderRadius = '50%';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.4)';
            
            marker.current = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
          
          // Atualizar círculo de precisão
          if (accuracyCircle) {
            const pixelsPerMeter = 1 / (Math.cos(latitude * Math.PI / 180) * 111111);
            const circleRadius = accuracy * pixelsPerMeter;
            
            accuracyCircle.setData({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              properties: {
                radius: circleRadius
              }
            });
          }
          
          // Armazenar a localização atual como um atributo de dados no container
          if (mapContainer.current) {
            // Criar um elemento de dados no container para que outros componentes possam acessar
            mapContainer.current.setAttribute('data-map-instance', 'true');
            mapContainer.current.setAttribute('data-position', JSON.stringify({ 
              latitude, 
              longitude,
              accuracy,
              timestamp: new Date().toISOString()
            }));
            mapContainer.current.setAttribute('data-timestamp', new Date().toISOString());
          }
        }
        
        setLoading(false);
        toast({
          title: "Localização atualizada",
          description: `Precisão: ${Math.round(accuracy)}m`,
          duration: 3000,
        });
      },
      (error) => {
        console.error('[MapInit] Geolocation error:', error);
        let errorMessage = 'Erro ao obter sua localização';
        
        if (error.code === 1) {
          errorMessage = 'Permissão de localização negada. Verifique as configurações do seu navegador.';
        } else if (error.code === 2) {
          errorMessage = 'Localização indisponível no momento. Tente novamente.';
        } else if (error.code === 3) {
          errorMessage = 'Tempo esgotado ao tentar obter sua localização.';
        }
        
        setMapError(errorMessage);
        setLoading(false);
        toast({
          title: "Erro de localização",
          description: errorMessage,
          variant: "destructive",
          duration: 4000,
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  }, [toast, updateViewport, accuracyCircle]);
  
  // Função para atualizar a visualização do mapa
  const updateViewport = (newViewport: Partial<MapViewport>) => {
    setViewport(current => ({
      ...current,
      ...newViewport
    }));
    
    if (map.current && newViewport.latitude && newViewport.longitude) {
      map.current.flyTo({
        center: [newViewport.longitude, newViewport.latitude],
        zoom: newViewport.zoom || viewport.zoom,
      });
    }
  };
  
  // Função para atualizar a localização (pode ser chamada por um botão)
  const handleUpdateLocation = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    mapContainer,
    map: map.current,
    mapInstance: map.current,
    marker: marker.current,
    viewport,
    updateViewport,
    mapError,
    loading,
    currentPosition,
    handleUpdateLocation,
    mapInitialized,
    isTokenValid: !!mapboxgl.accessToken
  };
};

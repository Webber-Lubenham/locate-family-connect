
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { LocationData } from '@/types/database';

// Configuração do Mapbox
mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';

interface MapViewProps {
  selectedUserId?: string;
  showControls?: boolean;
  locations?: LocationData[];
}

const MapView: React.FC<MapViewProps> = ({ 
  selectedUserId,
  showControls = true,
  locations = []
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Inicializar o mapa
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    try {
      console.log('Initializing map with center:', [Number(env.MAPBOX_CENTER?.split(',')[1] || -46.6388), Number(env.MAPBOX_CENTER?.split(',')[0] || -23.5489)], 'and zoom:', env.MAPBOX_ZOOM);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
        center: [Number(env.MAPBOX_CENTER?.split(',')[1] || -46.6388), Number(env.MAPBOX_CENTER?.split(',')[0] || -23.5489)],
        zoom: env.MAPBOX_ZOOM
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false
      }));

      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      toast({
        title: "Erro",
        description: "Falha ao inicializar o mapa",
        variant: "destructive"
      });
    }
  }, []);

  // Função para obter a localização atual do usuário
  const updateLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });

      if (map.current) {
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 15
        });

        // Limpar marcadores antigos
        clearMarkers();

        // Adicionar marcador da localização atual
        const newMarker = new mapboxgl.Marker({ color: '#0080ff' })
          .setLngLat([longitude, latitude])
          .addTo(map.current);
          
        markers.current.push(newMarker);

        // Salvar localização no banco de dados
        if (selectedUserId) {
          saveLocation(latitude, longitude);
        }
      }
    } catch (error: any) {
      console.error('Error getting location:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao obter localização",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Limpar marcadores existentes
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  // Salvar localização no banco de dados
  const saveLocation = async (latitude: number, longitude: number) => {
    try {
      // Usar a RPC para salvar a localização (contorna as políticas de RLS)
      const { data, error } = await supabase.client.rpc('save_student_location', { 
        p_latitude: latitude,
        p_longitude: longitude, 
        p_shared_with_guardians: true
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Localização atualizada com sucesso"
      });
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar localização",
        variant: "destructive"
      });
    }
  };

  // Mostrar localizações no mapa
  useEffect(() => {
    if (!map.current || !locations || locations.length === 0) return;
    
    console.log(`Fetching locations for user: ${selectedUserId}`);
    console.log(`Found ${locations.length} locations to display`);

    // Limpar marcadores antigos
    clearMarkers();
    
    // Adicionar marcadores para cada localização
    locations.forEach((location, index) => {
      // Criar popup com informações da localização
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <strong>${location.user?.full_name || 'Usuário'}</strong>
          <p>${new Date(location.timestamp).toLocaleString()}</p>
          ${location.address ? `<p>${location.address}</p>` : ''}
        `);
      
      // Adicionar marcador
      const marker = new mapboxgl.Marker({
        color: index === 0 ? '#0080ff' : '#888', // destacar a localização mais recente
      })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      markers.current.push(marker);
    });
    
    // Centralizar no mapa a localização mais recente
    if (locations[0]) {
      console.log(`Setting map center to most recent location: ${locations[0].latitude} ${locations[0].longitude}`);
      map.current.flyTo({
        center: [locations[0].longitude, locations[0].latitude],
        zoom: 15,
        essential: true
      });
      
      // Abrir o popup da localização mais recente
      markers.current[0].togglePopup();
    }
  }, [locations, selectedUserId]);

  // Limpar mapa ao desmontar componente
  useEffect(() => {
    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
      
      {showControls && (
        <div className="absolute bottom-4 right-4 z-10">
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md shadow-md hover:bg-primary-darker disabled:opacity-50"
            onClick={updateLocation}
            disabled={loading}
          >
            {loading ? "Obtendo..." : "Atualizar Localização"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;

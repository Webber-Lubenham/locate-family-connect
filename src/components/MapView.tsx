
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Definir o token do Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';

// Definindo interfaces para tipagem
interface MapViewProps {
  selectedUserId?: string | null;
  showControls?: boolean;
}

interface Location {
  id: string;
  user_id: string; // Alterado para string para manter consistência
  latitude: number;
  longitude: number;
  timestamp: string;
  user?: {
    full_name: string;
    user_type: string;
  } | null;
}

interface RawLocationData {
  id: string;
  user_id: string; // Alterado para string para manter consistência
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface ProfileData {
  id: string;
  full_name: string;
  user_type: string;
}

const MapView: React.FC<MapViewProps> = ({ selectedUserId, showControls = true }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState<number>(
    parseFloat(import.meta.env.VITE_MAPBOX_INITIAL_CENTER.split(',')[1]) || -46.6388
  );
  const [lat, setLat] = useState<number>(
    parseFloat(import.meta.env.VITE_MAPBOX_INITIAL_CENTER.split(',')[0]) || -23.5489
  );
  const [zoom, setZoom] = useState<number>(
    parseFloat(import.meta.env.VITE_MAPBOX_INITIAL_ZOOM) || 12
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);
  const trackingIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Inicialização do mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = () => {
      try {
        if (map.current) return; // Evita reinicialização

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: import.meta.env.VITE_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: zoom,
        });

        // Adiciona controles ao mapa
        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        map.current.on('load', () => {
          // Carrega dados de localização ao carregar o mapa
          fetchLocations();
        });

        map.current.on('move', () => {
          if (!map.current) return;
          const { lng, lat } = map.current.getCenter();
          setLng(parseFloat(lng.toFixed(4)));
          setLat(parseFloat(lat.toFixed(4)));
          setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Erro ao inicializar o mapa');
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Função para buscar o perfil de um usuário
  const fetchUserProfile = async (userId: string): Promise<ProfileData | null> => {
    try {
      const { data, error } = await supabase.client
        .from('profiles')
        .select('id, full_name, user_type')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as ProfileData;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  // Função para buscar localizações
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Se há um usuário específico selecionado, busca apenas suas localizações
      let query = supabase.client
        .from('locations')
        .select('id, user_id, latitude, longitude, timestamp')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (selectedUserId) {
        // Converter user_id para number para corresponder ao tipo do banco de dados
        // Mas verificar que é um número válido primeiro
        query = query.eq('user_id', selectedUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching locations:', error);
        setError(`Erro ao buscar localizações: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No location data found');
        setLocations([]);
        setLoading(false);
        return;
      }

      // Mapeia os dados brutos para as locações com informações de usuário
      const rawLocationData = data as RawLocationData[];
      
      // Para cada localização, busca o perfil do usuário associado
      const enhancedData = await Promise.all(
        rawLocationData.map(async (item) => {
          // Converter user_id para string para consistência no front-end
          const userId = String(item.user_id);
          let userData = null;
          
          try {
            userData = await fetchUserProfile(userId);
          } catch (err) {
            console.error(`Error fetching profile for user ${userId}:`, err);
          }

          return {
            ...item,
            user_id: userId,
            user: userData ? {
              full_name: userData.full_name || 'Unknown',
              user_type: userData.user_type || 'student'
            } : null
          };
        })
      );

      setLocations(enhancedData as Location[]);
      
      // Atualiza o mapa com as novas localizações
      updateMapMarkers(enhancedData as Location[]);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar marcadores no mapa
  const updateMapMarkers = (locationData: Location[]) => {
    if (!map.current || !locationData.length) return;

    // Remove marcadores existentes
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Adiciona novos marcadores
    locationData.forEach((location, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/684/684908.png)';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <strong>${location.user?.full_name || 'Usuário'}</strong><br>
          ${new Date(location.timestamp).toLocaleString()}<br>
          ${location.user?.user_type || 'student'}
        `);

      new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Se for a localização mais recente, centraliza o mapa nela
      if (index === 0 && !currentLocation) {
        map.current.flyTo({
          center: [location.longitude, location.latitude],
          essential: true,
          zoom: 15
        });
      }
    });
  };

  // Função para rastrear a localização atual
  const trackCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Geolocalização não é suportada pelo seu navegador",
        variant: "destructive"
      });
      return;
    }

    setTrackingEnabled(true);
    toast({
      title: "Rastreamento",
      description: "Rastreamento de localização iniciado",
    });

    // Função para obter a localização atual
    const getCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });

          // Voa para a localização atual
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              essential: true,
              zoom: 15
            });

            // Salva a localização no banco de dados
            saveLocation(latitude, longitude);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Erro",
            description: "Não foi possível obter sua localização",
            variant: "destructive"
          });
          setTrackingEnabled(false);
          if (trackingIntervalRef.current) {
            window.clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
          }
        }
      );
    };

    // Obter posição inicial
    getCurrentPosition();

    // Configurar intervalo para atualizar a localização
    if (trackingIntervalRef.current) {
      window.clearInterval(trackingIntervalRef.current);
    }
    
    // Atualizar a cada 30 segundos
    const intervalId = window.setInterval(getCurrentPosition, 30000);
    trackingIntervalRef.current = intervalId;
  };

  // Função para parar o rastreamento
  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      window.clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setTrackingEnabled(false);
    toast({
      title: "Rastreamento",
      description: "Rastreamento de localização interrompido",
    });
  };

  // Função para salvar a localização atual
  const saveLocation = async (latitude: number, longitude: number) => {
    try {
      if (!selectedUserId) {
        console.error('No user selected to save location');
        return;
      }

      // Salvar a localização no banco de dados
      const { error } = await supabase.client
        .from('locations')
        .insert({
          latitude,
          longitude,
          user_id: parseInt(selectedUserId) // Certifique-se de converter para número aqui
        });

      if (error) {
        console.error('Error saving location:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar sua localização",
          variant: "destructive"
        });
        return;
      }

      // Atualize os dados no mapa
      fetchLocations();

    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao salvar sua localização",
        variant: "destructive"
      });
    }
  };

  // Renderização do componente
  return (
    <div className="relative h-full w-full flex flex-col">
      <div ref={mapContainer} className="h-full w-full rounded-md overflow-hidden" />

      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-50 p-2 rounded shadow border border-red-300">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white p-4 rounded-md shadow-lg flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p>Carregando localizações...</p>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-4 left-4 space-y-2">
          {!trackingEnabled ? (
            <Button 
              onClick={trackCurrentLocation}
              className="flex items-center gap-2"
              variant="default"
            >
              <MapPin className="w-4 h-4" />
              Iniciar Rastreamento
            </Button>
          ) : (
            <Button 
              onClick={stopTracking}
              className="flex items-center gap-2"
              variant="destructive"
            >
              <MapPin className="w-4 h-4" />
              Parar Rastreamento
            </Button>
          )}
          
          <Button 
            onClick={fetchLocations}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Loader2 className="w-4 h-4" />
            Atualizar Dados
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;

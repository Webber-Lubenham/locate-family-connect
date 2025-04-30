import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { LocationData } from '@/types/database';

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';

interface UserInfo {
  full_name: string;
  role: string;
}

interface Location {
  id: string;
  user_id: string;  // Changed from number to string to match our type definitions
  latitude: number;
  longitude: number;
  timestamp: string;
  user: UserInfo;
}

// Raw data from Supabase may have a different structure
interface RawLocationData {
  id: string;
  user_id: string;  // Changed from number to string
  latitude: number;
  longitude: number;
  timestamp: string;
  user?: {
    full_name?: string;
    role?: string;
  } | null;
}

// Interfaces para respostas do Supabase
interface SupabaseListResponse<T> {
  data: T[] | null;
  error: Error | null;
  count?: number | null;
  status: number;
  statusText: string;
}

interface SupabaseSingleResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
  statusText: string;
}

// Adicionando interfaces para dados de perfil
interface ProfileData {
  user_id: string;  // Changed from number to string
  full_name: string;
  role: string;
  [key: string]: unknown; // Para outros campos que possam existir
}

type MapViewProps = {
  studentId?: string; // Optional, if provided will show only this student
  userLocation?: { latitude: number, longitude: number } | null; // Localização do usuário
};

const MapView = ({ studentId, userLocation }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<{[key: string]: mapboxgl.Marker}>({});
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Usando useCallback para memoizar a função processLocationData
  const processLocationData = useCallback((data: RawLocationData): Location => {
    return {
      id: data.id,
      user_id: data.user_id,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp,
      user: {
        full_name: data.user?.full_name || '',
        role: data.user?.role || ''
      }
    };
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (!studentId) {
          console.log("Nenhum ID de estudante fornecido");
          setLocations([]);
          setError("ID de estudante não fornecido");
          return;
        }
        
        // Primeiro, verificamos se o studentId é um UUID e tentamos obter o ID numérico do perfil
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
        
        let profileId = studentId; // valor padrão
        
        if (isUuid) {
          // Se é um UUID, precisamos encontrar o ID numérico correspondente
          console.log("Buscando ID numérico a partir do UUID:", studentId);
          const { data: profileData, error: profileError } = await supabase.client
            .from('profiles')
            .select('id')
            .eq('user_id', studentId)
            .maybeSingle();
            
          if (profileError) {
            console.error("Erro ao buscar perfil:", profileError);
          } else if (profileData) {
            profileId = String(profileData.id); // Convertendo para string
            console.log("ID numérico encontrado:", profileId);
          } else {
            console.log("Nenhum perfil encontrado para o UUID:", studentId);
          }
        }
        
        // Agora usamos o profileId (que pode ser o ID numérico ou o original)
        let query = supabase.client
          .from('locations')
          .select('id, user_id, latitude, longitude, timestamp')
          .order('timestamp', { ascending: false });
        
        // Filtramos pelo ID apropriado
        query = query.eq('user_id', profileId);
        
        const response = await query.limit(100);
        const { data, error } = response;
        
        if (error) {
          console.error("Erro na consulta de localização:", error);
          throw error;
        }
        
        // Process the data to ensure it matches our Location type
        if (data) {
          // Garantir que data é tratado como array
          const locationsData = Array.isArray(data) ? data : [data];
          
          // Buscar perfis de todos os user_id únicos
          const userIds = Array.from(new Set(locationsData.map(item => String(item.user_id))));  // Convertendo para string
          let profilesMap: Record<string, ProfileData> = {};
          
          if (userIds.length > 0) {
            const response = await supabase.client
              .from('profiles')
              .select('user_id, full_name, role')
              .in('user_id', userIds);
            const { data: profilesData, error: profilesError } = response;
            
            if (!profilesError && profilesData && Array.isArray(profilesData)) {
              profilesMap = profilesData.reduce<Record<string, ProfileData>>((acc, profile) => {
                if (profile && typeof profile === 'object' && 'user_id' in profile) {
                  acc[String(profile.user_id)] = {
                    user_id: String(profile.user_id),
                    full_name: profile.full_name || '',
                    role: profile.role || ''
                  };
                }
                return acc;
              }, {});
            }
          }
          
          // Processar cada localização com info do profile
          const processedData: Location[] = locationsData.map(item => {
            const profile = profilesMap[String(item.user_id)] || { 
              user_id: String(item.user_id), 
              full_name: '', 
              role: '' 
            };
            return {
              id: String(item.id),
              user_id: String(item.user_id),
              latitude: Number(item.latitude),
              longitude: Number(item.longitude),
              timestamp: String(item.timestamp),
              user: {
                full_name: profile.full_name || '',
                role: profile.role || ''
              }
            };
          });
          
          setLocations(processedData);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Se ocorrer um erro, verificamos se é um problema de tipo de dado
        if (err instanceof Error && err.message.includes("invalid input syntax for type integer")) {
          console.log("Erro de tipo de dados - tentando abordagem alternativa");
          // Podemos tentar uma abordagem alternativa aqui
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
    
    // Set up real-time subscription for location updates
    const subscription = supabase.client
      .channel('locations-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'locations',
          // Não usamos o filtro por enquanto devido a problemas de compatibilidade de tipos
          // filter: studentId ? `user_id=eq.${studentId}` : undefined
        }, 
        (payload) => {
          console.log("Nova localização detectada:", payload);
          // Fetch the full location data with user info
          const fetchNewLocation = async () => {
            // Verificamos primeiro se esta localização é do estudante que estamos monitorando
            if (studentId) {
              // Primeiro, verificamos se o studentId é um UUID e tentamos obter o ID numérico do perfil
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
              let profileId = studentId; // valor padrão
              
              if (isUuid) {
                // Se é um UUID, precisamos encontrar o ID numérico correspondente
                const { data: profileData, error: profileError } = await supabase.client
                  .from('profiles')
                  .select('id')
                  .eq('user_id', studentId)
                  .maybeSingle();
                  
                if (!profileError && profileData) {
                  profileId = String(profileData.id);  // Convertendo para string
                }
              }
              
              // Verificamos se a localização é para o estudante que estamos monitorando
              if (String(payload.new.user_id) !== profileId) {  // Convertendo para string
                console.log("Localização não pertence ao estudante monitorado");
                return;
              }
            }
            
            const response = await supabase.client
              .from('locations')
              .select('id, user_id, latitude, longitude, timestamp')
              .eq('id', payload.new.id)
              .single();
            const { data, error } = response;
              
            if (!error && data) {
              // Process the data to ensure it matches our Location type
              const locationData = data as unknown as RawLocationData;  // Usando unknown para fazer a conversão segura
              const processedLocation = {
                ...processLocationData({
                  ...locationData,
                  user_id: String(locationData.user_id)  // Garantindo que user_id é string
                }),
                user: {
                  full_name: '',
                  role: ''
                }
              };
              
              // Buscar informações de perfil se necessário
              try {
                const { data: profileData, error: profileError } = await supabase.client
                  .from('profiles')
                  .select('full_name, role')
                  .eq('id', String(locationData.user_id))  // Convertendo para string
                  .maybeSingle();
                  
                if (!profileError && profileData && typeof profileData === 'object') {
                  processedLocation.user = {
                    full_name: profileData.full_name || '',
                    role: profileData.role || ''
                  };
                }
              } catch (err) {
                console.error("Erro ao buscar perfil para localização em tempo real:", err);
              }
              
              setLocations(prevLocations => [processedLocation, ...prevLocations]);
            }
          };
          
          fetchNewLocation();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [studentId, processLocationData]);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // safety check

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-46.6388, -23.5489], // Default to São Paulo
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    // Clear markers when component is unmounted
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      for (const markerId in markersRef.current) {
        markersRef.current[markerId].remove();
      }
      
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, []);

  // Update map with user location
  useEffect(() => {
    if (!map.current || !userLocation) return;
    
    // Remove previous marker if exists
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    
    // Create custom element for user marker
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4285F4';
    el.style.border = '3px solid #fff';
    el.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
    
    // Add marker to map
    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<p><strong>Sua localização atual</strong></p>')
      )
      .addTo(map.current);
    
    // Center map on user location
    map.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 15,
      essential: true
    });
    
    console.log('[MAP] Exibindo localização do usuário:', userLocation);
  }, [userLocation]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || locations.length === 0) return;

    // Wait for map to be loaded
    if (!map.current.loaded()) {
      map.current.on('load', updateMarkers);
    } else {
      updateMarkers();
    }

    function updateMarkers() {
      if (!map.current) return;
      
      // Clear existing markers
      for (const marker of Object.values(markersRef.current)) {
        marker.remove();
      }
      markersRef.current = {};
      
      // Create new markers for each location
      for (const location of locations) {
        if (!map.current) return;
        
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = location.user.role === 'student' ? '#9b87f5' : '#7E69AB';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${location.user.full_name}</strong><br>
           <span>Última atualização: ${new Date(location.timestamp).toLocaleString()}</span>`
        );

        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(popup)
          .addTo(map.current);
          
        markersRef.current[location.id] = marker;
      }
      
      // If we have at least one location, fit the map to show all markers
      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        for (const location of locations) {
          bounds.extend([location.longitude, location.latitude]);
        }
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }
  }, [locations]);

  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-gray-200 shadow-md relative">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-educonnect-purple" />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-red-50 p-4 rounded-md text-red-700 max-w-md">
            <h3 className="font-bold">Erro ao carregar localizações</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;

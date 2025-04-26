import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';

interface UserInfo {
  full_name: string;
  role: string;
}

interface Location {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  user: UserInfo;
}

// Raw data from Supabase may have a different structure
interface RawLocationData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  user: any; // This could be the problematic part
}

type MapViewProps = {
  studentId?: string; // Optional, if provided will show only this student
  userLocation?: { latitude: number, longitude: number } | null; // Localização do usuário
};

const MapView = ({ studentId, userLocation }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<{[key: string]: mapboxgl.Marker}>({});
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Helper function to process raw location data
  const processLocationData = (data: RawLocationData): Location => {
    return {
      id: data.id,
      user_id: data.user_id,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp,
      user: {
        full_name: '',
        user_type: ''
      }
    };
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        let query = supabase
          .from('locations')
          .select('id, user_id, latitude, longitude, timestamp')
          .order('timestamp', { ascending: false });
        
        // If studentId is provided, filter by it
        if (studentId) {
          query = query.eq('user_id', studentId);
        }
        
        const { data, error } = await query.limit(100);
        
        if (error) throw error;
        
        // Process the data to ensure it matches our Location type
        if (data) {
          // Buscar perfis de todos os user_id únicos
          const userIds = Array.from(new Set(data.map((item: any) => item.user_id)));
          let profilesMap: Record<string, any> = {};
          if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('user_id, full_name, user_type')
              .in('user_id', userIds);
            if (!profilesError && profilesData) {
              profilesMap = profilesData.reduce((acc: any, profile: any) => {
                acc[profile.user_id] = profile;
                return acc;
              }, {});
            }
          }
          // Processar cada localização com info do profile
          const processedData: Location[] = data.map((item: any) => {
            const profile = profilesMap[item.user_id] || { full_name: '', user_type: '' };
            return {
              ...item,
              user: {
                full_name: profile.full_name,
                user_type: profile.user_type
              }
            };
          });
          setLocations(processedData);
        }
      } catch (err: any) {
        console.error('Error fetching locations:', err);
        setError(err.message);
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
          filter: studentId ? `user_id=eq.${studentId}` : undefined
        }, 
        (payload) => {
          // Fetch the full location data with user info
          const fetchNewLocation = async () => {
            const { data, error } = await supabase
              .from('locations')
              .select('id, user_id, latitude, longitude, timestamp, user:user_id(full_name, role)')
              .eq('id', payload.new.id)
              .single();
              
            if (!error && data) {
              // Process the data to ensure it matches our Location type
              const processedLocation = processLocationData(data as RawLocationData);
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
  }, [studentId]);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
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
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      // Create new markers for each location
      locations.forEach(location => {
        if (!map.current) return;
        
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = location.user.user_type === 'student' ? '#9b87f5' : '#7E69AB';
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
      });
      
      // If we have at least one location, fit the map to show all markers
      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(location => {
          bounds.extend([location.longitude, location.latitude]);
        });
        
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-educonnect-purple"></div>
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

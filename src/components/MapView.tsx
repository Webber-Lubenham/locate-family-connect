
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

// Define interfaces for location data
interface RawLocationData {
  id: string;
  user_id: string; // Changed from number to string for consistency
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface ProfileData {
  user_id: string; // Changed from number to string
  full_name: string;
  role: string;
}

interface Location extends RawLocationData {
  user?: {
    full_name: string;
    role: string;
  } | null;
}

interface MapViewProps {
  selectedUserId?: string;
  showControls?: boolean;
}

const MapView = ({ selectedUserId, showControls = true }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { user } = useUser();
  const { toast } = useToast();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;

    // Setup MapBox
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    
    // Get initial center from env or use default
    const initialCenter = import.meta.env.VITE_MAPBOX_INITIAL_CENTER?.split(',').map(Number) || 
        [-46.6388, -23.5489];
    
    // Create map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: import.meta.env.VITE_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
      center: [initialCenter[0], initialCenter[1]], // Longitude, Latitude
      zoom: Number(import.meta.env.VITE_MAPBOX_INITIAL_ZOOM || 12),
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
      
      // Clear all markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, []);

  // Fetch location data on mount and when selectedUserId changes
  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('locations')
          .select(`
            id,
            user_id,
            latitude,
            longitude,
            timestamp
          `)
          .order('timestamp', { ascending: false });
        
        // If a specific user is selected, filter by user_id
        if (selectedUserId) {
          // Need to convert selectedUserId to number to match the DB schema
          query = query.eq('user_id', selectedUserId);
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching locations:', error);
          setError(`Failed to fetch locations: ${error.message}`);
          return;
        }
        
        // For each location, fetch the associated user profile
        const locationsWithProfiles = await Promise.all(
          (data as any[]).map(async (location) => {
            // Ensure user_id is treated as string for consistency
            const userId = String(location.user_id);
            
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, user_type as role')
              .eq('user_id', userId)
              .single();
            
            // Return enhanced location object
            return {
              ...location,
              user_id: String(location.user_id), // Convert to string
              user: profileError ? null : {
                full_name: profile?.full_name || 'Unknown',
                role: profile?.role || 'student'
              }
            };
          })
        );
        
        setLocations(locationsWithProfiles);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while fetching location data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLocations();
  }, [selectedUserId]);

  // Update map markers whenever locations change
  useEffect(() => {
    if (!map.current || !map.current.loaded() || locations.length === 0) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Create new markers for each location
    locations.forEach((location) => {
      // Create a new DOM element for the marker
      const el = document.createElement('div');
      el.className = 'mapbox-marker';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#3b82f6';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
      
      // Create a popup with user info
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div>
            <h3 class="font-bold text-lg">${location.user?.full_name || 'Unknown'}</h3>
            <p>${new Date(location.timestamp).toLocaleString()}</p>
            ${location.user?.role ? `<p>Tipo: ${location.user.role}</p>` : ''}
          </div>
        `);
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Store the marker reference for later removal
      markersRef.current[location.id] = marker;
    });
    
    // If there are locations, fit the map to show all markers
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
  }, [locations, map.current]);

  // Share current location function
  const shareLocation = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para compartilhar sua localização",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSharing(true);
      
      // Request user's current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Convert user_id to string for consistency
          const userId = String(user.id);
          
          // Insert new location into database
          const { data, error } = await supabase
            .from('locations')
            .insert([{
              user_id: userId,  // Ensure this is passed as string
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            }])
            .select();
          
          if (error) {
            console.error('Error saving location:', error);
            toast({
              title: "Erro",
              description: "Não foi possível salvar sua localização",
              variant: "destructive"
            });
            return;
          }
          
          // Get user profile information
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, user_type as role')
            .eq('user_id', userId)
            .single();
          
          // Update locations state with the new location
          if (data && data.length > 0) {
            const newLocation = {
              ...data[0],
              user_id: String(data[0].user_id), // Ensure user_id is string
              user: profileError ? null : {
                full_name: profile?.full_name || 'Unknown',
                role: profile?.role || 'student'
              }
            };
            
            setLocations(prev => [newLocation as Location, ...prev]);
          }
          
          toast({
            title: "Sucesso",
            description: "Sua localização foi compartilhada",
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          toast({
            title: "Erro",
            description: "Não foi possível obter sua localização. Verifique as permissões do navegador.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true }
      );
    } catch (err) {
      console.error('Error sharing location:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao compartilhar sua localização",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      {/* Map container */}
      <div 
        ref={mapContainer} 
        className="absolute top-0 left-0 right-0 bottom-0"
      />
      
      {/* Error message */}
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-50 border border-red-200 rounded-md p-3 z-10">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-2 right-2 bg-white/80 rounded-md px-3 py-1 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-800">Carregando...</span>
          </div>
        </div>
      )}
      
      {/* Share location button */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            onClick={shareLocation}
            disabled={isSharing || !user}
            className="shadow-lg"
          >
            {isSharing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Compartilhando...</span>
              </div>
            ) : (
              <span>Compartilhar Minha Localização</span>
            )}
          </Button>
        </div>
      )}
      
      {/* Attribution */}
      <div className="absolute bottom-0 right-0 p-2 text-xs text-gray-500">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
};

export default MapView;


import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from './ui/use-toast';
import { LocationData } from '@/types/database';

// Definir o token do Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';

interface MapViewProps {
  selectedUserId?: string | undefined;
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
  const { toast } = useToast();

  const [mapInitialized, setMapInitialized] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (map.current || !mapContainer.current) {
      return;
    }

    try {
      console.log("Initializing map with center:", [-46.6388, -23.5489], "and zoom:", 12);
      
      // Create the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-46.6388, -23.5489], // São Paulo default
        zoom: 12
      });

      if (showControls) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      }
      
      // Wait for map to finish loading
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapInitialized(true);
      });

      // Set initial user position
      getCurrentPosition();
    } catch (error) {
      console.error("Error initializing map:", error);
    }
    
    return () => {
      // Cleanup markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !mapInitialized) {
      return;
    }
    
    console.log("Fetching locations for user:", selectedUserId);
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add markers for provided locations
    if (locations && locations.length > 0) {
      console.log(`Found ${locations.length} locations to display`);
      
      // Sort locations by timestamp, newest first
      const sortedLocations = [...locations].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Use the most recent location to center the map
      const mostRecent = sortedLocations[0];
      if (mostRecent) {
        console.log("Setting map center to most recent location:", mostRecent.latitude, mostRecent.longitude);
        map.current.setCenter([mostRecent.longitude, mostRecent.latitude]);
        map.current.setZoom(15);
      }
      
      // Add markers for all locations
      sortedLocations.forEach((location, index) => {
        const isNewest = index === 0;
        
        // Create a marker element
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = isNewest ? '25px' : '15px';
        el.style.height = isNewest ? '25px' : '15px';
        el.style.borderRadius = '50%';
        el.style.background = isNewest ? '#3b82f6' : '#94a3b8';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        // Create popup content
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div>
              <h4 style="margin:0;font-weight:bold;">${location.user?.full_name || 'Usuário'}</h4>
              <p style="margin:0;">${new Date(location.timestamp).toLocaleString()}</p>
              <p style="margin:0;font-size:small;">Lat: ${location.latitude.toFixed(6)}, Long: ${location.longitude.toFixed(6)}</p>
            </div>
          `);
          
        // Add the marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(popup)
          .addTo(map.current!);
          
        markers.current.push(marker);
        
        // Open popup for newest location
        if (isNewest) {
          marker.togglePopup();
        }
      });
    } else {
      console.log("No location data found");
      
      // If we're showing controls, try to get the current position
      if (showControls) {
        getCurrentPosition();
      }
    }
  }, [locations, mapInitialized, selectedUserId]);

  const getCurrentPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          setCurrentPosition({ latitude, longitude });
          
          if (map.current && mapInitialized) {
            map.current.setCenter([longitude, latitude]);
            map.current.setZoom(15);
            
            // Add a marker for the current position
            const el = document.createElement('div');
            el.className = 'current-location';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.background = '#4f46e5';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)';
            
            // Remove previous current position marker
            markers.current = markers.current.filter(marker => {
              if (marker.getElement().classList.contains('current-location')) {
                marker.remove();
                return false;
              }
              return true;
            });
            
            // Add the new current position marker
            const marker = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML('<h4>Sua localização atual</h4>'))
              .addTo(map.current!);
              
            markers.current.push(marker);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedUserId || !currentPosition) {
      toast({
        title: "Erro",
        description: "Não foi possível determinar sua localização atual",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.client
        .from('locations')
        .insert([
          { 
            user_id: selectedUserId,
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude
          }
        ])
        .select();
        
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Localização salva",
        description: "Sua localização foi registrada com sucesso",
      });
      
      // Update the map with the new location
      if (map.current) {
        // Add a pulsing effect to indicate successful save
        const el = document.createElement('div');
        el.className = 'saved-location';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.background = '#10b981';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 0 rgba(16, 185, 129, 0.4)';
        el.style.animation = 'pulse 2s infinite';
        
        // Add animation style
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
            }
          }
        `;
        document.head.appendChild(style);
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([currentPosition.longitude, currentPosition.latitude])
          .setPopup(new mapboxgl.Popup().setHTML('<h4>Localização salva!</h4><p>Localização registrada com sucesso.</p>'))
          .addTo(map.current!);
          
        marker.togglePopup();
        
        // Remove the marker after 3 seconds
        setTimeout(() => {
          marker.remove();
        }, 3000);
      }
    } catch (err: any) {
      console.error("Error saving location:", err);
      toast({
        title: "Erro ao salvar localização",
        description: err.message || "Ocorreu um erro ao registrar sua localização",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button 
            onClick={getCurrentPosition}
            className="mr-2 shadow-md"
            variant="outline"
            disabled={loading}
          >
            Atualizar Localização
          </Button>
          
          <Button 
            onClick={handleSaveLocation}
            className="shadow-md"
            disabled={!currentPosition || loading}
          >
            {loading ? 'Salvando...' : 'Salvar Localização'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;

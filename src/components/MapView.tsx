import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { LocationData } from '@/types/database';
import MapMarker from './map/MapMarker';
import MapControls from './map/MapControls';
import { useMapLocation } from '@/hooks/useMapLocation';
import { useToast } from '@/components/ui/use-toast';

// Verificar que o token do Mapbox está definido globalmente
if (!mapboxgl.accessToken) {
  mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
  console.log('MapBox Token:', mapboxgl.accessToken);
}

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
  const [mapInitialized, setMapInitialized] = useState(false);
  const { toast } = useToast();
  
  const { loading, updateLocation } = useMapLocation({ 
    selectedUserId 
  });
  
  // Initialize the map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    try {
      console.log('Initializing map with center:', [
        Number(env.MAPBOX_CENTER?.split(',')[1] || -46.6388), 
        Number(env.MAPBOX_CENTER?.split(',')[0] || -23.5489)
      ], 'and zoom:', env.MAPBOX_ZOOM);
      
      // Garantir token do Mapbox
      if (!mapboxgl.accessToken) {
        mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
      }
      
      // Ensure mapContainer is ready
      if (!mapContainer.current) {
        console.error('Map container not found');
        return;
      }
      
      // Create map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
        center: [
          Number(env.MAPBOX_CENTER?.split(',')[1] || -46.6388), 
          Number(env.MAPBOX_CENTER?.split(',')[0] || -23.5489)
        ],
        zoom: env.MAPBOX_ZOOM || 12,
        attributionControl: false
      });

      // Add essential controls
      map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false
      }));

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapInitialized(true);
        
        // After map loads, show any locations
        if (locations && locations.length > 0) {
          showLocationsOnMap();
        }
      });
      
      // Add error handler
      map.current.on('error', (e) => {
        console.error('MapBox Error:', e.error);
        toast({
          title: "Erro no mapa",
          description: "Falha ao carregar o mapa. Tente novamente.",
          variant: "destructive"
        });
      });
      
    } catch (error) {
      console.error('Failed to initialize map:', error);
      toast({
        title: "Erro no mapa",
        description: "Não foi possível inicializar o mapa",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Display locations on the map
  useEffect(() => {
    if (!map.current || !locations || locations.length === 0) return;
    
    // If map is initialized, show locations
    if (mapInitialized) {
      showLocationsOnMap();
    }
    // Otherwise, wait for map to be loaded
    else if (map.current) {
      map.current.once('load', () => {
        showLocationsOnMap();
      });
    }
  }, [locations, selectedUserId, mapInitialized]);
  
  // Function to show locations on map
  const showLocationsOnMap = () => {
    if (!map.current || !locations.length) return;
    
    try {
      console.log(`Fetching locations for user: ${selectedUserId}`);
      console.log(`Found ${locations.length} locations to display`);
      
      // Center on most recent location
      if (locations[0]) {
        const centerLng = locations[0].longitude;
        const centerLat = locations[0].latitude;
        
        console.log(`Setting map center to most recent location: ${centerLat} ${centerLng}`);
        
        map.current.flyTo({
          center: [centerLng, centerLat],
          zoom: 15,
          essential: true
        });
      }
    } catch (error) {
      console.error('Error displaying locations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mostrar as localizações no mapa",
        variant: "destructive"
      });
    }
  };

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg" 
        style={{ minHeight: "400px" }}
      />

      {/* Render markers for each location */}
      {map.current && mapInitialized && locations.map((location, index) => {
        // Create popup content
        const popupContent = `
          <strong>${location.user?.full_name || 'Usuário'}</strong>
          <p>${new Date(location.timestamp).toLocaleString()}</p>
          ${location.address ? `<p>${location.address}</p>` : ''}
        `;
        
        return (
          <MapMarker
            key={location.id}
            map={map.current!}
            latitude={location.latitude}
            longitude={location.longitude}
            color={index === 0 ? '#0080ff' : '#888'}
            popupContent={popupContent}
            isActive={index === 0}
          />
        );
      })}
      
      <MapControls
        showControls={showControls}
        onUpdateLocation={() => updateLocation(map.current)}
        loading={loading}
      />
    </div>
  );
};

export default MapView;

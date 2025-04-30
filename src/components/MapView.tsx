
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { LocationData } from '@/types/database';
import MapMarker from './map/MapMarker';
import MapControls from './map/MapControls';
import { useMapLocation } from '@/hooks/useMapLocation';

// Configuração do Mapbox - definimos o token antes mesmo da inicialização do componente
mapboxgl.accessToken = env.MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
console.log('MapBox Token:', mapboxgl.accessToken);

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
      
      // Verificamos se o token do Mapbox está definido corretamente
      if (!mapboxgl.accessToken) {
        console.error('MapBox Token não está definido');
        return;
      }
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
        center: [
          Number(env.MAPBOX_CENTER?.split(',')[1] || -46.6388), 
          Number(env.MAPBOX_CENTER?.split(',')[0] || -23.5489)
        ],
        zoom: env.MAPBOX_ZOOM || 12
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
      
      // Adicionamos um handler para capturar erros do mapa
      map.current.on('error', (e) => {
        console.error('MapBox Error:', e.error);
      });
      
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }, []);

  // Display locations on the map
  useEffect(() => {
    if (!map.current || !locations || locations.length === 0) return;
    
    console.log(`Fetching locations for user: ${selectedUserId}`);
    console.log(`Found ${locations.length} locations to display`);
    
    // Center on most recent location
    if (locations[0]) {
      console.log(`Setting map center to most recent location: ${locations[0].latitude} ${locations[0].longitude}`);
      map.current.flyTo({
        center: [locations[0].longitude, locations[0].latitude],
        zoom: 15,
        essential: true
      });
    }
  }, [locations, selectedUserId]);

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
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />

      {/* Render markers for each location */}
      {map.current && locations.map((location, index) => {
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

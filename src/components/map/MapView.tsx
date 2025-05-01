import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapLocation } from '@/hooks/useMapLocation';
import type { LocationData } from '@/types/database';
import type { MapMarker } from '@/types/map';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, MapPin } from 'lucide-react';

interface MapViewProps {
  selectedUserId?: string;
  showControls?: boolean;
  locations: LocationData[];
  onLocationUpdate?: () => void;
}

export default function MapView({ 
  selectedUserId, 
  showControls = true, 
  locations,
  onLocationUpdate 
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { viewport, updateViewport, mapError, isTokenValid } = useMapInitialization();
  const { loading: locationLoading, updateLocation } = useMapLocation({
    onViewportChange: (newViewport) => {
      updateViewport(newViewport);
      onLocationUpdate?.();
    }
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !isTokenValid) return;

    // Wait for container to be properly mounted
    const initMap = () => {
      if (!mapContainer.current) return;

      // Clear any existing content and markers
      while (mapContainer.current.firstChild) {
        mapContainer.current.removeChild(mapContainer.current.firstChild);
      }
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Initialize map after a small delay to ensure DOM is ready
      setTimeout(() => {
        if (!mapContainer.current) return;
        
        try {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [viewport.longitude, viewport.latitude],
            zoom: viewport.zoom,
            attributionControl: false,
            preserveDrawingBuffer: true
          });

          map.current.on('load', () => {
            setMapLoaded(true);
            console.log('Map loaded successfully');
          });

          // Add controls if enabled
          if (showControls) {
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
            map.current.addControl(
              new mapboxgl.GeolocateControl({
                positionOptions: {
                  enableHighAccuracy: true
                },
                trackUserLocation: true
              })
            );
          }
        } catch (error) {
          console.error('Failed to create map instance:', error);
        }
      }, 100);
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(initMap);

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [viewport, showControls, isTokenValid]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Convert locations to markers
    const mapMarkers: MapMarker[] = locations.map(location => ({
      latitude: location.latitude,
      longitude: location.longitude,
      color: '#0080ff',
      popup: {
        title: 'Localização',
        content: `${new Date(location.timestamp).toLocaleString()}`
      }
    }));

    // Add new markers
    mapMarkers.forEach(markerData => {
      const marker = new mapboxgl.Marker({ color: markerData.color })
        .setLngLat([markerData.longitude, markerData.latitude]);

      if (markerData.popup) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3 class="font-semibold">${markerData.popup.title}</h3>
            <p>${markerData.popup.content}</p>
          `);
        marker.setPopup(popup);
      }

      marker.addTo(map.current!);
      markers.current.push(marker);
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
  }, [locations, mapLoaded]);

  return (
    <Card className="w-full h-full min-h-[400px] relative">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <p className="text-destructive">Erro ao carregar o mapa: {mapError}</p>
        </div>
      )}
      {showControls && selectedUserId && (
        <div className="absolute bottom-4 right-4 z-30">
          <Button
            variant="default"
            size="sm"
            onClick={updateLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="ml-2">Atualizar Localização</span>
          </Button>
        </div>
      )}
    </Card>
  );
} 
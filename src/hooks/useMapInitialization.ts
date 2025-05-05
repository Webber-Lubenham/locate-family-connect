
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { useMapLocation } from './useMapLocation';

export interface MapViewport {
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

export function useMapInitialization(initialViewport: MapViewport = DEFAULT_VIEWPORT) {
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  
  const { loading, updateLocation } = useMapLocation({
    selectedUserId: undefined
  });

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      const error = 'Token do Mapbox não está configurado';
      console.error(error);
      setMapError(error);
      return;
    }

    // Verify if mapContainer is available
    if (!mapContainer.current) return;

    try {
      // Initialize map only if it hasn't been initialized yet
      if (!mapInstance.current) {
        mapInstance.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
          center: [viewport.longitude, viewport.latitude],
          zoom: viewport.zoom
        });

        mapInstance.current.on('load', () => {
          setMapInitialized(true);
        });
      }
    } catch (error: any) {
      console.error('Error initializing map:', error);
      setMapError(error.message || 'Error initializing map');
    }

    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const updateViewport = (newViewport: Partial<MapViewport>) => {
    setViewport(current => ({
      ...current,
      ...newViewport
    }));

    // Update map if available
    if (mapInstance.current) {
      // Determine if we're on the parent dashboard for higher zoom level
      const isParentDashboard = window.location.pathname.includes('parent-dashboard');
      const zoomLevel = isParentDashboard 
        ? Math.max(newViewport.zoom || viewport.zoom, 16) // Higher zoom for parent dashboard
        : (newViewport.zoom || viewport.zoom);
        
      mapInstance.current.flyTo({
        center: [newViewport.longitude || viewport.longitude, newViewport.latitude || viewport.latitude],
        zoom: zoomLevel,
        essential: true,
        speed: 0.8 // Smoother animation
      });
    }
  };

  const handleUpdateLocation = async () => {
    const location = await updateLocation(mapInstance.current);
    if (location) {
      // Determine if we're on the parent dashboard for higher zoom level
      const isParentDashboard = window.location.pathname.includes('parent-dashboard');
      const zoomLevel = isParentDashboard ? 17 : 15;
      
      updateViewport({
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: zoomLevel
      });
    }
  };

  return {
    mapContainer,
    mapInstance,
    viewport,
    updateViewport,
    mapError,
    isTokenValid: !!mapboxgl.accessToken,
    mapInitialized,
    handleUpdateLocation
  };
}

export type MapInitializationResult = ReturnType<typeof useMapInitialization>;

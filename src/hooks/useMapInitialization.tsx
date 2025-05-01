import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';

interface MapViewport {
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

export const useMapInitialization = (initialViewport: MapViewport = DEFAULT_VIEWPORT) => {
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const [mapError, setMapError] = useState<string | null>(null);

  // Verify token on mount
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      const error = 'Token do Mapbox não está configurado';
      console.error(error);
      setMapError(error);
    }
  }, []);

  const updateViewport = (newViewport: Partial<MapViewport>) => {
    setViewport(current => ({
      ...current,
      ...newViewport
    }));
  };

  return {
    viewport,
    updateViewport,
    mapError,
    isTokenValid: !!mapboxgl.accessToken
  };
};

import { useEffect, useState } from 'react';

interface MapInitializationResult {
  mapboxToken: string;
  defaultCenter: [number, number];
  defaultZoom: number;
  error: string | null;
}

export function useMapInitialization(): MapInitializationResult {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      setError('MapBox token não encontrado');
      return;
    }
    setMapboxToken(token);
    console.log('MapBox Token (useMapInitialization):', token);
  }, []);

  return {
    mapboxToken,
    defaultCenter: [-46.6388, -23.5489] as [number, number], // São Paulo
    defaultZoom: 12,
    error
  };
} 
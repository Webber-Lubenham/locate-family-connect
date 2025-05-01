import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { MapViewport } from '@/types/map';
import mapboxgl from 'mapbox-gl';

interface UseMapLocationProps {
  onViewportChange?: (viewport: MapViewport) => void;
  selectedUserId?: string;
}

export function useMapLocation({ onViewportChange, selectedUserId }: UseMapLocationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateLocation = async () => {
    setLoading(true);
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        const newViewport = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          zoom: 15
        };

        onViewportChange?.(newViewport);
      } else {
        throw new Error('Geolocation is not supported by your browser');
      }
    } catch (error: any) {
      console.error('Error getting location:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível obter sua localização',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateLocation
  };
}

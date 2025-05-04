
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { MapViewport } from './useMapInitialization';

interface UseMapLocationProps {
  selectedUserId?: string;
  onViewportChange?: (viewport: MapViewport) => void;
}

export function useMapLocation({ selectedUserId, onViewportChange }: UseMapLocationProps = {}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateLocation = async (mapInstance?: mapboxgl.Map | null) => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // If we have a map instance, update it
      if (mapInstance) {
        mapInstance.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          essential: true
        });

        if (onViewportChange) {
          onViewportChange({
            latitude,
            longitude,
            zoom: 15
          });
        }
      }

      // If we have a selectedUserId, save the location
      if (selectedUserId) {
        const { error } = await supabase
          .from('locations')
          .insert([{
            user_id: selectedUserId,
            latitude,
            longitude,
            shared_with_guardians: true
          }]);

        if (error) throw error;
      }

      toast({
        title: "Localização atualizada",
        description: "Sua localização foi atualizada com sucesso."
      });

      return { latitude, longitude };
    } catch (error: any) {
      console.error('Erro ao atualizar localização:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar sua localização",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateLocation };
}

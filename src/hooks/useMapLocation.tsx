
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface UseMapLocationProps {
  selectedUserId?: string;
}

export const useMapLocation = ({ selectedUserId }: UseMapLocationProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { toast } = useToast();

  // Function to get current user location
  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      return { latitude, longitude };
    } catch (error: any) {
      console.error('Error getting location:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao obter localização",
        variant: "destructive"
      });
      return null;
    }
  };

  // Function to update and save location
  const updateLocation = async (map: mapboxgl.Map | null) => {
    if (!map) return;
    
    setLoading(true);

    try {
      const location = await getCurrentLocation();
      
      if (!location) {
        setLoading(false);
        return;
      }
      
      const { latitude, longitude } = location;
      setUserLocation({ latitude, longitude });

      map.flyTo({
        center: [longitude, latitude],
        zoom: 15
      });

      // Save location if selectedUserId is provided
      if (selectedUserId) {
        await saveLocation(latitude, longitude);
      }
      
      return { latitude, longitude };
    } finally {
      setLoading(false);
    }
  };

  // Save location to database
  const saveLocation = async (latitude: number, longitude: number) => {
    try {
      // Use RPC to save the location (contorna as políticas de RLS)
      const { data, error } = await supabase.client.rpc('save_student_location', { 
        p_latitude: latitude,
        p_longitude: longitude, 
        p_shared_with_guardians: true
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Localização atualizada com sucesso"
      });
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar localização",
        variant: "destructive"
      });
    }
  };

  return {
    loading,
    userLocation,
    updateLocation,
    getCurrentLocation
  };
};

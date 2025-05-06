import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Location as LocationType } from '../types';

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_REGION = {
  latitude: -23.5505,  // São Paulo como padrão
  longitude: -46.6333,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function useMapIntegration() {
  const [mapRegion, setMapRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solicitar permissões de localização ao inicializar
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        
        if (status === 'granted') {
          await getCurrentPosition();
        }
      } catch (error: any) {
        setError(`Erro de permissão: ${error.message}`);
      }
    })();
  }, []);

  // Obter posição atual
  const getCurrentPosition = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      
      setMapRegion({
        latitude,
        longitude,
        ...DEFAULT_DELTA
      });
      
      return { latitude, longitude };
    } catch (error: any) {
      setError(`Erro ao obter localização: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Centralizar mapa em uma localização específica
  const centerMapOnLocation = (latitude: number, longitude: number) => {
    setMapRegion({
      latitude,
      longitude,
      ...DEFAULT_DELTA
    });
  };

  // Centralizar mapa em um conjunto de localizações (útil para visualizar histórico)
  const fitMapToLocations = (locations: LocationType[]) => {
    if (!locations || locations.length === 0) return;
    
    // Se houver apenas uma localização, centralizar nela
    if (locations.length === 1) {
      const { latitude, longitude } = locations[0];
      centerMapOnLocation(latitude, longitude);
      return;
    }
    
    // Calcular os limites para todas as localizações
    const lats = locations.map(loc => loc.latitude);
    const lngs = locations.map(loc => loc.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Calcular o centro
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calcular o delta com um padding
    const latDelta = (maxLat - minLat) * 1.2;
    const lngDelta = (maxLng - minLng) * 1.2;
    
    setMapRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  // Formatar endereço para exibição
  const formatCoordinates = (latitude: number, longitude: number) => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  return {
    mapRegion,
    currentLocation,
    permissionStatus,
    loading,
    error,
    getCurrentPosition,
    centerMapOnLocation,
    fitMapToLocations,
    formatCoordinates
  };
}

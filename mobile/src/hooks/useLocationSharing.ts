import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { Alert, Platform } from 'react-native';

// Hook para gerenciar o compartilhamento de localização
// Reutiliza a mesma função RPC do PostgreSQL (save_student_location)
export function useLocationSharing(userId: string, userFullName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ latitude: number; longitude: number; timestamp: string } | null>(null);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);

  // Solicitar permissões de localização - fundamental para a experiência mobile
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Erro ao solicitar permissão de localização:', err);
      return false;
    }
  };

  // Obter localização atual com alta precisão
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Permissão de localização não concedida');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;
      const timestamp = new Date().toISOString();
      
      const locationData = { latitude, longitude, timestamp };
      setLastLocation(locationData);
      
      return locationData;
    } catch (err: any) {
      setError('Erro ao obter localização: ' + (err.message || 'Desconhecido'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Salvar localização no banco usando a mesma função RPC do projeto web
  const saveLocationToDatabase = async (
    latitude: number, 
    longitude: number, 
    sharedWithGuardians: boolean
  ) => {
    try {
      const { data, error } = await supabase.rpc('save_student_location', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_shared_with_guardians: sharedWithGuardians
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao salvar localização:', err);
      return { success: false, error: err.message };
    }
  };

  // Carregar histórico de localizações do usuário
  const loadLocationHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setLocationHistory(data || []);
      return data;
    } catch (err: any) {
      setError('Erro ao carregar histórico: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função principal para compartilhar a localização - invoca a Edge Function
  const shareLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Obter localização atual
      const location = await getCurrentLocation();
      if (!location) {
        throw new Error('Não foi possível obter sua localização atual');
      }
      
      // 2. Salvar no banco com flag de compartilhamento
      const saveResult = await saveLocationToDatabase(
        location.latitude, 
        location.longitude,
        true // Compartilhado com responsáveis
      );
      
      if (!saveResult.success) {
        throw new Error('Falha ao salvar localização: ' + saveResult.error);
      }
      
      // 3. Invocar a Edge Function share-location para enviar emails
      // Usa a mesma Edge Function do projeto web
      const { data, error } = await supabase.functions.invoke('share-location', {
        body: { 
          latitude: location.latitude, 
          longitude: location.longitude,
          studentName: userFullName
        }
      });
      
      if (error) throw error;
      
      // 4. Feedback ao usuário
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Localização Compartilhada",
          "Sua localização foi compartilhada com seus responsáveis",
          [{ text: "OK" }]
        );
      }
      
      return { success: true, data };
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao compartilhar localização';
      setError(errorMsg);
      
      if (Platform.OS !== 'web') {
        Alert.alert("Erro", errorMsg, [{ text: "OK" }]);
      }
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar rastreamento periódico de localização
  const startLocationTracking = async (intervalMs = 60000) => {
    // Implementar no futuro para a versão 1.0 após o MVP
    // Requer controles específicos de otimização de bateria
  };

  return {
    shareLocation,
    getCurrentLocation,
    loadLocationHistory,
    locationHistory,
    lastLocation,
    loading,
    error
  };
}

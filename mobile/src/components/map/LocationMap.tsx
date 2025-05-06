import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Location as LocationType } from '../../types';

type LocationMapProps = {
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  locations?: LocationType[];
  isLoading?: boolean;
  error?: string | null;
  userName?: string;
  singleLocation?: boolean;
};

/**
 * Componente reutilizável para exibição do mapa de localização
 * Segue o princípio de componentes pequenos e focados em uma única responsabilidade
 */
export default function LocationMap({
  mapRegion,
  locations = [],
  isLoading = false,
  error = null,
  userName = 'Usuário',
  singleLocation = false,
}: LocationMapProps) {
  // Se não há localizações para exibir, mostra o estado vazio
  const hasLocations = locations && locations.length > 0;
  
  // Formatação da data para exibição no marcador
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !hasLocations ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhuma localização disponível para exibição.
          </Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          showsCompass
          showsMyLocationButton
        >
          {locations.map((location, index) => (
            <Marker
              key={location.id || index}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`Localização de ${userName}`}
              description={`Compartilhada em: ${formatDate(location.created_at)}`}
              // Se estamos exibindo múltiplas localizações, destacar a mais recente
              pinColor={singleLocation || index === 0 ? "#4F46E5" : "#94A3B8"}
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 8,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
  },
});

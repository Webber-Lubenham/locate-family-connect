import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Location as LocationType } from '../../types';

type LocationHistoryListProps = {
  locations: LocationType[];
  isLoading?: boolean;
  onLocationPress?: (location: LocationType) => void;
  emptyMessage?: string;
};

/**
 * Componente para exibir lista de histórico de localizações
 * Segue o princípio de componentes com no máximo 50 linhas
 */
export default function LocationHistoryList({
  locations,
  isLoading = false,
  onLocationPress,
  emptyMessage = "Nenhum histórico de localização disponível."
}: LocationHistoryListProps) {
  
  // Formatar data e hora para exibição
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Formatação simplificada de coordenadas 
  const formatCoordinates = (latitude: number, longitude: number) => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  // Renderiza um item da lista de histórico
  const renderLocationItem = ({ item }: { item: LocationType }) => (
    <TouchableOpacity 
      style={styles.locationItem}
      onPress={() => onLocationPress && onLocationPress(item)}
    >
      <Text style={styles.locationTime}>
        {formatDateTime(item.created_at)}
      </Text>
      
      <Text style={styles.locationAddress}>
        {item.address || formatCoordinates(item.latitude, item.longitude)}
      </Text>
      
      {item.shared_with_guardians && (
        <View style={styles.sharedBadge}>
          <Text style={styles.sharedText}>Compartilhado</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (locations.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={locations}
      renderItem={renderLocationItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  locationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  sharedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sharedText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 14,
  },
});

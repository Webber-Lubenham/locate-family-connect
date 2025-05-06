import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { useLocationSharing } from '../hooks/useLocationSharing';

type StudentDashboardProps = {
  navigation: any;
};

export default function StudentDashboard({ navigation }: StudentDashboardProps) {
  const { user, signOut, userType } = useAuth();
  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudante';
  
  const { 
    shareLocation, 
    getCurrentLocation, 
    loadLocationHistory,
    locationHistory,
    lastLocation, 
    loading, 
    error 
  } = useLocationSharing(user?.id || '', userFullName);

  const [mapRegion, setMapRegion] = useState({
    latitude: -23.5505,  // São Paulo como default (pode ser ajustado conforme localização padrão do projeto)
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Obter localização inicial ao abrir o app
  useEffect(() => {
    const initialize = async () => {
      // Carregar histórico de localizações
      await loadLocationHistory();
      
      // Buscar localização atual
      const location = await getCurrentLocation();
      if (location) {
        setMapRegion({
          ...mapRegion,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    };

    initialize();
  }, []);

  // Função para compartilhar localização com responsáveis
  const handleShareLocation = async () => {
    // Confirmar antes de compartilhar
    Alert.alert(
      "Compartilhar Localização",
      "Deseja compartilhar sua localização atual com seus responsáveis?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Compartilhar",
          onPress: async () => {
            const result = await shareLocation();
            if (result.success) {
              // Atualizar o histórico após o compartilhamento
              loadLocationHistory();
            }
          }
        }
      ]
    );
  };

  // Função para atualizar a localização sem compartilhar
  const handleUpdateLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setMapRegion({
        ...mapRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, {userFullName}</Text>
          <Text style={styles.subtitleText}>
            {userType === 'student' ? 'Dashboard do Estudante' : 'Dashboard do Usuário'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            Alert.alert(
              "Sair",
              "Deseja realmente sair do aplicativo?",
              [
                {
                  text: "Cancelar",
                  style: "cancel"
                },
                {
                  text: "Sair",
                  onPress: signOut
                }
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Mapa com a localização atual */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Sua Localização</Text>
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Carregando mapa...</Text>
            </View>
          )}
          
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            showsUserLocation
            showsMyLocationButton
            showsCompass
          >
            {lastLocation && (
              <Marker
                coordinate={{
                  latitude: lastLocation.latitude,
                  longitude: lastLocation.longitude,
                }}
                title="Sua localização"
                description={`Atualizado em: ${new Date(lastLocation.timestamp).toLocaleString()}`}
              />
            )}
          </MapView>
          
          <View style={styles.mapControls}>
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={handleUpdateLocation}
              disabled={loading}
            >
              <Text style={styles.mapButtonText}>Atualizar Localização</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Histórico de compartilhamentos */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Histórico de Compartilhamentos</Text>
          
          {locationHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhum histórico de compartilhamento ainda.
              </Text>
            </View>
          ) : (
            locationHistory.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
                <Text style={styles.historyDetails}>
                  {item.shared_with_guardians ? 'Compartilhado com responsáveis' : 'Localização registrada'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Botão principal de compartilhamento */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.shareButtonText}>Compartilhar Localização</Text>
          )}
        </TouchableOpacity>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: a2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  map: {
    height: 300,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#334155',
  },
  mapControls: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  mapButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#334155',
    fontWeight: '500',
  },
  historyContainer: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  historyDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  shareButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
});

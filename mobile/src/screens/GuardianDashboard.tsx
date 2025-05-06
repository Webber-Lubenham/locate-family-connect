import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Alert, FlatList } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type GuardianDashboardProps = {
  navigation: any;
};

type Student = {
  id: string;
  name: string;
  email: string;
  last_shared?: string;
};

type LocationData = {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  user_id: string;
  address?: string;
  student_name?: string;
};

export default function GuardianDashboard({ navigation }: GuardianDashboardProps) {
  const { user, signOut } = useAuth();
  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Responsável';
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentLocations, setStudentLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mapRegion, setMapRegion] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Carregar lista de estudantes vinculados ao responsável
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usando o email do responsável para buscar estudantes vinculados
        const guardianEmail = user?.email;
        
        if (!guardianEmail) {
          throw new Error('Email do responsável não encontrado');
        }

        // Buscar relações na tabela guardians
        const { data, error } = await supabase
          .from('guardians')
          .select(`
            id,
            student_id,
            profiles:student_id (
              id,
              full_name,
              email
            )
          `)
          .eq('email', guardianEmail)
          .eq('is_active', true);

        if (error) throw error;

        if (data && data.length > 0) {
          // Formatar dados para exibição
          const formattedStudents = data.map(item => ({
            id: item.student_id,
            name: item.profiles?.full_name || 'Estudante',
            email: item.profiles?.email || '',
          }));

          setStudents(formattedStudents);
          
          // Se houver estudantes, selecionar o primeiro por padrão
          if (formattedStudents.length > 0) {
            setSelectedStudent(formattedStudents[0]);
            loadStudentLocations(formattedStudents[0].id);
          }
        }
      } catch (err: any) {
        setError('Erro ao carregar estudantes: ' + err.message);
        console.error('Erro ao carregar estudantes:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadStudents();
    }
  }, [user]);

  // Carregar localizações do estudante selecionado
  const loadStudentLocations = async (studentId: string) => {
    try {
      setLocationLoading(true);
      setError(null);

      // Usando a função RPC para buscar localizações compartilhadas
      // Esta função verifica a relação guardião-estudante e respeita RLS
      const { data, error } = await supabase.rpc(
        'get_student_locations_for_guardian',
        { p_student_id: studentId }
      );

      if (error) throw error;

      if (data && data.length > 0) {
        setStudentLocations(data);
        
        // Centralizar mapa na localização mais recente
        setMapRegion({
          ...mapRegion,
          latitude: data[0].latitude,
          longitude: data[0].longitude,
        });
      } else {
        setStudentLocations([]);
      }
    } catch (err: any) {
      setError('Erro ao carregar localizações: ' + err.message);
      console.error('Erro ao carregar localizações:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Selecionar um estudante para visualizar localizações
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    loadStudentLocations(student.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, {userFullName}</Text>
          <Text style={styles.subtitleText}>Dashboard do Responsável</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            Alert.alert(
              "Sair",
              "Deseja realmente sair do aplicativo?",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", onPress: signOut }
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Carregando estudantes...</Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Você ainda não possui estudantes vinculados.
          </Text>
          <Text style={styles.emptyStateSubText}>
            Aguarde até que um estudante vincule você como responsável.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Lista de estudantes */}
          <View style={styles.studentsContainer}>
            <Text style={styles.sectionTitle}>Seus Estudantes</Text>
            <FlatList
              data={students}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.studentCard,
                    selectedStudent?.id === item.id && styles.selectedStudentCard
                  ]}
                  onPress={() => handleSelectStudent(item)}
                >
                  <Text style={[
                    styles.studentName,
                    selectedStudent?.id === item.id && styles.selectedStudentName
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.studentsList}
            />
          </View>

          {/* Mapa com localizações */}
          {selectedStudent && (
            <View style={styles.mapContainer}>
              <Text style={styles.sectionTitle}>
                Localizações de {selectedStudent.name}
              </Text>
              
              {locationLoading ? (
                <View style={styles.mapLoadingContainer}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Carregando localizações...</Text>
                </View>
              ) : studentLocations.length === 0 ? (
                <View style={styles.emptyMapContainer}>
                  <Text style={styles.emptyMapText}>
                    Nenhuma localização compartilhada por este estudante.
                  </Text>
                </View>
              ) : (
                <>
                  <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    region={mapRegion}
                    showsCompass
                  >
                    {studentLocations.map((location, index) => (
                      <Marker
                        key={index}
                        coordinate={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }}
                        title={`Localização de ${selectedStudent.name}`}
                        description={`Compartilhada em: ${formatDate(location.created_at)}`}
                        pinColor={index === 0 ? "#4F46E5" : "#94A3B8"}
                      />
                    ))}
                  </MapView>

                  {/* Lista de localizações recentes */}
                  <View style={styles.locationsListContainer}>
                    <Text style={styles.locationsListTitle}>
                      Localizações Recentes
                    </Text>
                    
                    {studentLocations.slice(0, 5).map((location, index) => (
                      <View key={index} style={styles.locationItem}>
                        <Text style={styles.locationTime}>
                          {formatDate(location.created_at)}
                        </Text>
                        <Text style={styles.locationAddress}>
                          {location.address || `Lat: ${location.latitude.toFixed(4)}, Long: ${location.longitude.toFixed(4)}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#64748B',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  studentsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  studentsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  studentCard: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedStudentCard: {
    backgroundColor: '#4F46E5',
  },
  studentName: {
    color: '#334155',
    fontWeight: '500',
  },
  selectedStudentName: {
    color: '#FFFFFF',
  },
  mapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapLoadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMapContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyMapText: {
    color: '#64748B',
    textAlign: 'center',
  },
  map: {
    height: 300,
  },
  locationsListContainer: {
    padding: 16,
  },
  locationsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  locationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  locationTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
  },
});

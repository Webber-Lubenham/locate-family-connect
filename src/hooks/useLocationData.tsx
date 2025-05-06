import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { LocationData } from '@/types/database';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

export function useLocationData(selectedUserId: string | null, userEmail?: string, userType?: string) {
  // Use the standardized query hook for consistent error handling
  const { 
    data: locationData, 
    loading, 
    error, 
    executeQuery, 
    resetState 
  } = useSupabaseQuery<LocationData[]>();

  // Create mock data for development mode
  const createMockLocationData = useCallback((): LocationData[] => [
    {
      id: '1',
      user_id: selectedUserId || '',
      latitude: -23.550520,
      longitude: -46.633309,
      timestamp: new Date().toISOString(),
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      user: {
        full_name: 'Estudante Teste (DEV)',
        user_type: 'student'
      }
    }
  ], [selectedUserId]);

  // Function to fetch location data using our standardized query hook
  const fetchLocationData = useCallback(async () => {
    if (!selectedUserId) return { data: null, error: 'Nenhum usuário selecionado ou autenticado' };

    console.log('[DEBUG] StudentMap - Fetching locations for:', selectedUserId);
    
    return executeQuery(
      async () => {
        let result;
        
        if (userType === 'parent' && userEmail) {
          // Parent viewing student location - use the secure function
          console.log('[DEBUG] StudentMap - Parent viewing student location, using get_student_locations function');
          
          result = await supabase.rpc('get_student_locations', {
            p_guardian_email: userEmail,
            p_student_id: selectedUserId
          });
          
          // Handle empty result as no data instead of error
          if (!result.error && (!result.data || result.data.length === 0)) {
            console.log('[DEBUG] StudentMap - No data available');
            return { data: [], error: null };
          }
        } else {
          // Student viewing own location - direct query
          console.log('[DEBUG] StudentMap - Student viewing own location, using direct query');
            
          result = await supabase
            .from('locations')
            .select(`
              id, 
              user_id, 
              latitude, 
              longitude, 
              timestamp,
              address
            `)
            .eq('user_id', selectedUserId)
            .order('timestamp', { ascending: false })
            .limit(10);
        }
        
        console.log('[DEBUG] StudentMap - Query result:', result);
        
        if (result.data) {
          // Normalize data structure
          const normalizedData = result.data.map((item: any) => ({
            ...item,
            timestamp: item.timestamp || item.location_timestamp || new Date().toISOString(),
            user: {
              full_name: item.student_name || 'Estudante',
              user_type: 'student'
            }
          }));

          // Sort the locations by timestamp (newest first)
          const sortedData = normalizedData.sort((a: LocationData, b: LocationData) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA; // Descending order - newest first
          });
          
          return { data: sortedData, error: null };
        }
        
        return result;
      },
      { selectedUserId, userType, userEmail },
      {
        mockData: createMockLocationData(),
        successMessage: locationData?.length === 0 ? 'Nenhuma localização encontrada' : undefined
      }
    );
  }, [selectedUserId, userEmail, userType, executeQuery, createMockLocationData, locationData?.length]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  return { 
    locationData, 
    loading, 
    error, 
    fetchLocationData,
    resetErrorState: resetState
  };
}

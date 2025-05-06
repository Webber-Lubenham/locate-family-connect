
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LocationData } from '@/types/database';

export function useLocationData(selectedUserId: string | null, userEmail?: string, userType?: string) {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocation() {
      try {
        setLoading(true);
        setError(null);

        // Determine which user_id to use
        const targetUserId = selectedUserId;

        if (!targetUserId) {
          setError('Nenhum usuário selecionado ou autenticado');
          setLoading(false);
          return;
        }

        console.log('[DEBUG] StudentMap - Fetching locations for:', targetUserId);
        
        let data;
        let locationError = null;
        
        if (userType === 'parent' && userEmail) {
          // Parent viewing student location - use the secure function
          console.log('[DEBUG] StudentMap - Parent viewing student location, using get_student_locations function');
          
          // Use the get_student_locations function
          const result = await supabase.rpc('get_student_locations', {
            p_guardian_email: userEmail,
            p_student_id: targetUserId
          });
          
          console.log('[DEBUG] StudentMap - RPC result:', result);
          data = result.data;
          locationError = result.error;
          
          // Handle empty result as no data instead of error
          if (!data || data.length === 0) {
            console.log('[DEBUG] StudentMap - No data available');
            data = [];
          }
        } else {
          // Student viewing own location - direct query
          console.log('[DEBUG] StudentMap - Student viewing own location, using direct query');
            
          // Direct query with the UUID
          const result = await supabase
            .from('locations')
            .select(`
              id, 
              user_id, 
              latitude, 
              longitude, 
              timestamp,
              address
            `)
            .eq('user_id', targetUserId)
            .order('timestamp', { ascending: false })
            .limit(10);
          
          console.log('[DEBUG] StudentMap - Direct query result:', result);
          data = result.data;
          locationError = result.error;
        }

        if (locationError) {
          console.error('[DEBUG] StudentMap - Error fetching location:', locationError);
          setError(`Erro ao buscar dados de localização: ${locationError.message}`);
          setLoading(false);
          return;
        }

        // Normalize data structure
        const normalizedData = data ? data.map((item: any) => ({
          ...item,
          timestamp: item.timestamp || item.location_timestamp || new Date().toISOString(),
          user: {
            full_name: item.student_name || 'Estudante',
            user_type: 'student'
          }
        })) : [];

        // Sort the locations by timestamp (newest first)
        const sortedData = normalizedData.sort((a: LocationData, b: LocationData) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA; // Descending order - newest first
        });

        console.log('[DEBUG] StudentMap - Normalized location data:', sortedData);
        console.log('[DEBUG] StudentMap - Locations sorted check:');
        sortedData.forEach((loc: LocationData, idx: number) => {
          console.log(`Location ${idx}: ${new Date(loc.timestamp).toLocaleString()}`);
        });

        setLocationData(sortedData as LocationData[]);
        
        if (sortedData.length === 0) {
          console.log('[DEBUG] StudentMap - No location data found');
        }
      } catch (err) {
        console.error('[DEBUG] StudentMap - Unexpected error:', err);
        setError('Ocorreu um erro inesperado ao buscar dados de localização');
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, [selectedUserId, userEmail, userType]);

  return { locationData, loading, error };
}

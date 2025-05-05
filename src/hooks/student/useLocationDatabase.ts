
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';

/**
 * Hook to handle location database operations
 */
export function useLocationDatabase() {
  /**
   * Saves location to the database
   */
  const saveLocationToDatabase = useCallback(async (latitude: number, longitude: number): Promise<boolean> => {
    try {
      console.log(`[LocationDatabase] Saving location: ${latitude}, ${longitude}`);
      
      // Option 1: Use specific RPC function (recommended)
      const { data, error } = await supabase.rpc('save_student_location', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_shared_with_guardians: true
      });
      
      if (error) {
        console.error('[LocationDatabase] Error saving location via RPC:', error);
        
        // Option 2: Fallback to direct insertion
        const { error: insertError } = await supabase
          .from('locations')
          .insert([{
            latitude,
            longitude,
            shared_with_guardians: true
          }]);
        
        if (insertError) {
          console.error('[LocationDatabase] Error in direct insertion fallback:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('[LocationDatabase] Exception saving location:', error);
      return false;
    }
  }, []);

  return {
    saveLocationToDatabase
  };
}

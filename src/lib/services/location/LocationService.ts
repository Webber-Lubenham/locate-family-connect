
import { BaseService } from '../base/BaseService';
import { LocationData } from '@/types/database';
import { useUser } from '@/contexts/UnifiedAuthContext';

/**
 * Service responsible for handling student location data
 */
export class LocationService extends BaseService {
  /**
   * Get student locations
   * 
   * @param studentId - The ID of the student whose locations to fetch
   * @param userType - The type of user making the request ('student' or 'parent')
   */
  async getStudentLocations(studentId: string, userType?: string): Promise<LocationData[]> {
    console.log(`[LocationService] getStudentLocations called: studentId=${studentId}, userType=${userType}`);
    
    try {
      let response;
      
      // If the user is a parent/guardian, use the RPC function that respects RLS policies
      if (userType === 'parent') {
        console.log('[LocationService] Getting locations as parent/guardian via RPC');
        
        // Use the RPC function designed specifically for guardian access
        response = await this.supabase
          .rpc('get_student_locations_for_guardian', {
            p_student_id: studentId
          });
        
        console.log('[LocationService] RPC result status:', response.status);
        console.log('[LocationService] RPC result error:', response.error);
        console.log('[LocationService] RPC result data count:', response.data?.length || 0);
      } else {
        // Default behavior for students viewing their own locations
        console.log('[LocationService] Getting locations as student/default');
        response = await this.supabase
          .from('locations')
          .select('*')
          .eq('user_id', studentId)
          .order('timestamp', { ascending: false });
      }
      
      if (response.error) {
        console.error('[LocationService] Database error:', response.error);
        throw response.error;
      }
      
      console.log(`[LocationService] Returning ${response.data?.length || 0} locations`);
      // Log each location for debug
      if (response.data && response.data.length > 0) {
        response.data.forEach((loc, i) => {
          console.log(`[LocationService] Location ${i+1}: ID=${loc.id}, shared=${loc.shared_with_guardians}, timestamp=${loc.timestamp}`);
        });
      }
      
      return response.data || [];
    } catch (error: any) {
      console.error('[LocationService] Error fetching student locations:', error);
      this.showError('Não foi possível buscar as localizações');
      return [];
    }
  }
}

export const locationService = new LocationService();

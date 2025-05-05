
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
      const currentUser = await this.getCurrentUser();
      console.log(`[LocationService] Current user: ${currentUser.email}`);
      
      // If the user is a parent/guardian, use the RPC function 
      if (userType === 'parent') {
        console.log('[LocationService] Getting locations as parent/guardian via RPC');
        
        // Use the updated RPC function designed for parent access
        response = await this.supabase
          .rpc('get_parent_student_locations', {
            p_parent_email: currentUser.email,
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
          console.log(`[LocationService] Location ${i+1}: ID=${loc.id}, timestamp=${loc.timestamp || loc.location_timestamp}`);
        });
      }
      
      // Normalize the data format to ensure consistent structure
      const normalizedData = (response.data || []).map(loc => ({
        id: loc.id,
        user_id: loc.user_id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp || loc.location_timestamp,
        address: loc.address || null,
        shared_with_guardians: loc.shared_with_guardians || true,
        student_name: loc.student_name,
        student_email: loc.student_email,
        user: {
          full_name: loc.student_name || 'Estudante',
          user_type: 'student'
        }
      }));
      
      return normalizedData;
    } catch (error: any) {
      console.error('[LocationService] Error fetching student locations:', error);
      this.showError('Não foi possível buscar as localizações');
      return [];
    }
  }
}

export const locationService = new LocationService();

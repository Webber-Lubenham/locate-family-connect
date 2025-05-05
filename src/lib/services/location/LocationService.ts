
import { BaseService } from '../base/BaseService';
import { LocationData } from '@/types/database';

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
      
      // If the user is a parent/guardian, use the direct query with RLS protection
      if (userType === 'parent') {
        console.log('[LocationService] Getting locations as parent/guardian');
        
        // Use direct query to the locations table - RLS will handle permissions
        response = await this.supabase
          .from('locations')
          .select(`
            id, 
            user_id, 
            latitude, 
            longitude, 
            timestamp,
            address,
            profiles!inner (
              full_name,
              email
            )
          `)
          .eq('user_id', studentId)
          .order('timestamp', { ascending: false });
        
        console.log('[LocationService] Query result status:', response.status);
        console.log('[LocationService] Query result error:', response.error);
        console.log('[LocationService] Query result data count:', response.data?.length || 0);
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
          console.log(`[LocationService] Location ${i+1}: ID=${loc.id}, timestamp=${loc.timestamp}`);
        });
      }
      
      // Normalize the data format to ensure consistent structure
      const normalizedData = (response.data || []).map(loc => ({
        id: loc.id,
        user_id: loc.user_id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp,
        address: loc.address || null,
        shared_with_guardians: loc.shared_with_guardians || true,
        student_name: loc.profiles?.full_name || 'Estudante',
        student_email: loc.profiles?.email,
        user: {
          full_name: loc.profiles?.full_name || 'Estudante',
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

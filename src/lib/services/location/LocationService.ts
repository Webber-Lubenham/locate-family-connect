
import { BaseService } from '../base/BaseService';
import { LocationData } from '@/types/database';

/**
 * Service responsible for handling student location data
 */
export class LocationService extends BaseService {
  /**
   * Get student locations
   */
  async getStudentLocations(studentId: string): Promise<LocationData[]> {
    try {
      // Get locations
      const { data, error } = await this.supabase
        .from('locations')
        .select('*')
        .eq('user_id', studentId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('[LocationService] Error fetching student locations:', error);
      this.showError('Não foi possível buscar as localizações');
      return [];
    }
  }
}

export const locationService = new LocationService();

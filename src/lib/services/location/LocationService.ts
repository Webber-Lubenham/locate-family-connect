
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
      const { data: { user } } = await this.supabase.auth.getUser();
      const currentUser = user;
      
      if (!currentUser) {
        this.showError('Você precisa estar autenticado para acessar localizações');
        return [];
      }

      console.log('[LocationService] Current user:', currentUser.email);

      // Se o usuário é um responsável, usar a função RPC segura para acessar localizações
      if (userType === 'parent' || userType === 'guardian') {
        console.log('[LocationService] Getting locations as parent/guardian via secure function');
        
        // Usar a nova função segura que acessa a view privada
        const { data, error } = await this.supabase
          .rpc('get_guardian_locations_secure', {
            p_student_id: studentId
          });
        
        if (error) {
          console.error('[LocationService] Erro ao acessar view:', error);
          
          // Tentar abordagem direta como fallback
          const result = await this.supabase
            .from('locations')
            .select(`
              id,
              user_id,
              latitude,
              longitude,
              timestamp,
              address,
              shared_with_guardians
            `)
            .eq('user_id', studentId)
            .eq('shared_with_guardians', true)
            .order('timestamp', { ascending: false });
          
          if (result.error) {
            console.error('[LocationService] Acesso direto falhou:', result.error);
            throw new Error('Não foi possível acessar as localizações');
          }
          
          console.log(`[LocationService] Localizações encontradas via acesso direto: ${result.data?.length || 0}`);
          return this.normalizeLocations(result.data || [], studentId);
        }
        
        console.log(`[LocationService] Localizações encontradas via view: ${data?.length || 0}`);
        return this.normalizeLocations(data || [], studentId);
      } else {
        // Estudante acessando suas próprias localizações
        console.log('[LocationService] Getting locations as student/default');
        
        const { data, error } = await this.supabase
          .from('locations')
          .select('*')
          .eq('user_id', studentId)
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error('[LocationService] Erro ao buscar localizações:', error);
          throw new Error('Não foi possível buscar suas localizações');
        }
        
        console.log(`[LocationService] Localizações encontradas: ${data?.length || 0}`);
        return this.normalizeLocations(data || [], studentId);
      }
    } catch (error: any) {
      console.error('[LocationService] Erro na busca de localizações:', error);
      this.showError('Não foi possível buscar as localizações');
      return [];
    }
  }
  
  /**
   * Normaliza os dados de localização para um formato consistente
   */
  private normalizeLocations(locations: any[], studentId: string): LocationData[] {
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return [];
    }
    
    return locations.map(loc => {
      // Determinar timestamp correto dentre os possíveis campos
      const timestamp = loc.location_timestamp || loc.timestamp || new Date().toISOString();
      
      // Determinar nome do estudante dentre os possíveis campos
      const studentName = loc.student_name || loc.name || loc.profiles?.full_name || 'Estudante';
      
      // Retornar objeto normalizado
      return {
        id: loc.id || `loc-${Date.now()}`,
        user_id: loc.user_id || studentId,
        latitude: Number(loc.latitude) || 0,
        longitude: Number(loc.longitude) || 0,
        timestamp: timestamp,
        address: loc.address || '',
        shared_with_guardians: loc.shared_with_guardians === undefined ? true : !!loc.shared_with_guardians,
        student_name: studentName,
        created_at: loc.created_at || timestamp,
        // Adicionar campos extras para compatibilidade
        user: {
          full_name: studentName,
          user_type: 'student'
        }
      };
    });
  }
}

export const locationService = new LocationService();

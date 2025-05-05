
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

      // Se o usuário é um responsável, usar função segura para acessar localizações
      if (userType === 'parent' || userType === 'guardian') {
        return await this.getLocationsAsGuardian(studentId);
      } else {
        // Estudante acessando suas próprias localizações
        return await this.getLocationsAsStudent(studentId);
      }
    } catch (error: any) {
      console.error('[LocationService] Erro na busca de localizações:', error);
      this.showError('Não foi possível buscar as localizações');
      return [];
    }
  }
  
  /**
   * Recupera localizações para um responsável
   */
  private async getLocationsAsGuardian(studentId: string): Promise<LocationData[]> {
    try {
      console.log('[LocationService] Tentando estratégias para obter localizações do estudante');
      
      // Estratégia 1: Tentar usar a função RPC otimizada
      try {
        console.log('[LocationService] Estratégia 1: Usando função RPC otimizada');
        // Usar type assertion para contornar o erro de tipagem
        const response = await this.supabase.rpc(
          'get_student_locations_with_names' as any,
          { p_student_id: studentId }
        );

        if (!response.error && response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`[LocationService] Estratégia 1 sucesso: ${response.data.length} localizações encontradas`);
          return this.normalizeLocations(response.data, studentId);
        }
        
        console.log('[LocationService] Estratégia 1 falhou ou não encontrou dados:', response.error?.message || 'Sem dados');
      } catch (error) {
        console.log('[LocationService] Estratégia 1 erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      }
      
      // Estratégia 2: Verificar permissão e tentar acesso direto à tabela locations
      try {
        console.log('[LocationService] Estratégia 2: Acesso direto à tabela locations');
        
        // 2.1 Primeiro verificar se o usuário é um responsável válido para o estudante
        const { data: guardianData, error: guardianError } = await this.supabase
          .from('guardians')
          .select('id, student_id, email')
          .eq('student_id', studentId)
          .eq('is_active', true)
          .single();
        
        if (guardianError || !guardianData) {
          console.log('[LocationService] Estratégia 2 falhou: Não é um responsável válido para este estudante');
          return []; // Não é um responsável válido
        }
        
        // 2.2 Buscar as localizações diretamente
        const { data: locationsData, error: locationsError } = await this.supabase
          .from('locations')
          .select('*')
          .eq('user_id', studentId)
          .eq('shared_with_guardians', true)
          .order('timestamp', { ascending: false });
        
        if (!locationsError && locationsData && locationsData.length > 0) {
          console.log(`[LocationService] Estratégia 2 sucesso: ${locationsData.length} localizações encontradas`);
          
          // Buscar também o nome do estudante separadamente
          const { data: profileData } = await this.supabase
            .from('profiles')
            .select('user_id, full_name')
            .eq('user_id', studentId)
            .single();
          
          // Adicionar o nome do estudante em cada localização
          const locationsWithName = locationsData.map((loc) => ({
            ...loc,
            student_name: profileData?.full_name || 'Estudante'
          }));
          
          return this.normalizeLocations(locationsWithName, studentId);
        }
        
        console.log('[LocationService] Estratégia 2 não encontrou dados');
      } catch (error) {
        console.log('[LocationService] Estratégia 2 erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      }
      
      console.log('[LocationService] Todas as estratégias falharam, não foram encontradas localizações');
      return [];
    } catch (error) {
      console.error('[LocationService] Erro ao buscar localizações do responsável:', error);
      return [];
    }
  }
  
  /**
   * Método auxiliar para chamar a função RPC com tipagem segura
   */
  private async callSecureFunction(studentId: string) {
    try {
      console.log('[LocationService] Usando nova função RPC get_student_locations_with_names');
      
      // Usar a nova função RPC otimizada com type assertion para contornar erro de tipagem
      const response = await this.supabase.rpc(
        'get_student_locations_with_names' as any,
        { p_student_id: studentId }
      );

      if (response.error) {
        console.log('[LocationService] Erro na função RPC otimizada:', response.error);
        
        // Registrar o erro nos logs para melhor diagnóstico
        await this.logError('get_student_locations_error', {
          studentId,
          errorCode: response.error.code,
          errorMessage: response.error.message,
          timestamp: new Date().toISOString()
        });

        throw new Error(`Erro ao acessar localizações: ${response.error.message}`);
      }

      console.log(`[LocationService] Localizações encontradas via RPC: ${response.data?.length || 0}`);
      
      return response as {
        data: {
          location_id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          location_timestamp: string;
          address: string | null;
          shared_with_guardians: boolean;
          student_name: string;
        }[] | null;
        error: Error | null;
      };
    } catch (error) {
      console.error('[LocationService] Erro ao acessar localizações:', error);
      return {
        data: null,
        error: new Error(error instanceof Error ? error.message : 'Erro desconhecido ao acessar localizações')
      } as any;
    }
  }
  
  /**
   * Registra um erro nos logs para diagnóstico futuro
   */
  private async logError(eventType: string, metadata: any) {
    try {
      await this.supabase.from('auth_logs').insert([
        {
          event_type: eventType,
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
          metadata,
          occurred_at: new Date().toISOString()
        }
      ]);
    } catch (logError) {
      // Apenas log no console, não queremos que falhas de logging interrompam a execução
      console.error('[LocationService] Erro ao registrar log:', logError);
    }
  }
  
  /**
   * Recupera localizações para um estudante
   */
  private async getLocationsAsStudent(studentId: string): Promise<LocationData[]> {
    try {
      console.log('[LocationService] Buscando localizações como estudante');
      
      const { data, error } = await this.supabase
        .from('locations')
        .select('*')
        .eq('user_id', studentId)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('[LocationService] Erro ao buscar localizações:', error);
        throw new Error('Não foi possível buscar suas localizações');
      }
      
      console.log(`[LocationService] ${data?.length || 0} localizações encontradas`);
      return this.normalizeLocations(data || [], studentId);
    } catch (error) {
      console.error('[LocationService] Erro ao buscar localizações do estudante:', error);
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
        id: loc.location_id || loc.id || `loc-${Date.now()}`, // Usar location_id da nova função
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

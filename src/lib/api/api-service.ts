
import { supabase } from '@/lib/supabase';
import { env } from '@/env';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
    console.log('[API] Initializing API service with base URL:', this.baseUrl);
  }

  /**
   * Fetch student profile details by ID
   */
  async getStudentDetails(studentId: string): Promise<ApiResponse<{
    id: number;
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    user_type: string;
    created_at: string;
    updated_at: string;
  } | null>> {
    try {
      console.log(`[API] Fetching student details for ID: ${studentId}`);
      
      // Try first with the user_id field (UUID format)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', studentId)
        .maybeSingle();
      
      // If no results from user_id, try with the id field as a number
      if (!data && !error) {
        const numericId = parseInt(studentId, 10);
        
        if (!isNaN(numericId)) {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', numericId)
            .maybeSingle();
            
          data = result.data;
          error = result.error;
        }
      }
      
      // If still no results, try directly querying by email if the ID looks like an email
      if (!data && !error && studentId.includes('@')) {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('email', studentId)
          .maybeSingle();
          
        data = result.data;
        error = result.error;
      }

      // If still no results, try getting data from locations table via RPC
      if (!data && !error) {
        const locationResult = await supabase.rpc(
          'get_student_locations', 
          { 
            p_guardian_email: null,  // We don't have the guardian email here
            p_student_id: studentId 
          }
        );
        
        if (locationResult.data && locationResult.data.length > 0) {
          // Extract student info from location data
          const studentInfo = locationResult.data[0];
          
          // Create a profile-like object from location data
          data = {
            id: -1,  // Placeholder ID
            user_id: studentId,
            full_name: studentInfo.student_name || 'Estudante',
            email: studentInfo.student_email || '',
            phone: '',
            user_type: 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          return {
            success: true,
            data: data
          };
        }
      }

      // Final check with guardians table for parent-student relationship
      if (!data && !error) {
        const { data: guardianData, error: guardianError } = await supabase
          .from('guardians')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle();

        if (guardianData && !guardianError) {
          data = {
            id: -1,  // Placeholder ID
            user_id: studentId,
            full_name: guardianData.full_name || 'Estudante',
            email: guardianData.email || '',
            phone: guardianData.phone || '',
            user_type: 'student',
            created_at: guardianData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          return {
            success: true,
            data: data
          };
        }
      }
      
      if (error) {
        console.error('[API] Error fetching student details:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      if (!data) {
        // Instead of logging a warning, we'll return a null result without an error
        // This prevents console warnings when no data is found
        return { 
          success: true, 
          data: null 
        };
      }
      
      console.log('[API] Student details retrieved:', data);
      return { 
        success: true, 
        data: data
      };
    } catch (error: any) {
      console.error('[API] Exception in getStudentDetails:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error fetching student details' 
      };
    }
  }

  /**
   * Compartilha a localização de um usuário via email usando a função edge
   */
  async shareLocation(guardianEmail: string, latitude: number, longitude: number, studentName: string): Promise<{success: boolean, message: string, details?: any}> {
    try {
      console.log(`[API] Compartilhando localização para ${guardianEmail} de ${studentName} : lat=${latitude}, long=${longitude}`);
      
      const payload = {
        guardianEmail,
        latitude,
        longitude,
        studentName
      };

      console.log('[API] Enviando payload para Edge Function:', payload);
      
      const { data, error } = await supabase.functions.invoke('share-location', {
        body: payload
      });
      
      if (error) {
        console.error('[API] Erro ao compartilhar localização:', error);
        return {
          success: false, 
          message: 'Falha ao compartilhar localização',
          details: error
        };
      }
      
      console.log('[API] Compartilhamento bem-sucedido:', data);
      return {
        success: true,
        message: 'Localização compartilhada com sucesso',
        details: data
      };
    } catch (error) {
      console.error('[API] Erro ao compartilhar localização:', error);
      return {
        success: false,
        message: 'Erro ao compartilhar localização',
        details: error
      };
    }
  }
  
  // Outros métodos da API podem ser adicionados aqui
}

// Exportar uma instância singleton do serviço de API
export const apiService = new ApiService();

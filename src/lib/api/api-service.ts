
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
  async getStudentDetails(studentId: string): Promise<ApiResponse<{name: string; email: string} | null>> {
    try {
      console.log(`[API] Fetching student details for ID: ${studentId}`);
      
      // Try first with the user_id field
      let { data, error } = await supabase.client
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', studentId)
        .maybeSingle();
      
      // If no results, try with direct id field as fallback
      // Use type casting to handle the potential type mismatch between string and number
      if (!data && !error) {
        // First check if the studentId can be parsed as a number
        const numericId = parseInt(studentId, 10);
        
        if (!isNaN(numericId)) {
          const result = await supabase.client
            .from('profiles')
            .select('email, full_name')
            .eq('id', numericId) // Using the numeric version for id
            .maybeSingle();
            
          data = result.data;
          error = result.error;
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
        console.warn('[API] No student details found for ID:', studentId);
        return { 
          success: true, 
          data: null 
        };
      }
      
      console.log('[API] Student details retrieved:', data);
      return { 
        success: true, 
        data: {
          name: data.full_name,
          email: data.email
        }
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
  async shareLocation(
    email: string,
    latitude: number,
    longitude: number,
    senderName: string,
    isRequest = false
  ): Promise<boolean> {
    try {
      console.log(`[API] Compartilhando localização para ${email} de ${senderName} : lat=${latitude}, long=${longitude}`);
      
      // Preparar payload para o envio
      const payload = {
        email,
        latitude,
        longitude,
        senderName,
        isRequest
      };
      
      console.log('[API] Enviando payload para Edge Function:', payload);

      // Obter sessão para autorização
      const { data: { session } } = await supabase.client.auth.getSession();
      
      if (!session) {
        console.error('[API] Sessão não encontrada. Usuário precisa estar autenticado para compartilhar localização');
        return false;
      }

      // Chamar a função edge de compartilhamento
      const { data, error } = await supabase.client.functions.invoke('share-location', { 
        body: payload,
      });

      if (error) {
        console.error('[API] Erro ao chamar a função edge:', error);
        return false;
      }

      console.log('[API] Compartilhamento bem-sucedido:', data);
      return true;
    } catch (error: any) {
      console.error('[API] Erro ao compartilhar localização:', error);
      return false;
    }
  }
  
  // Outros métodos da API podem ser adicionados aqui
}

// Exportar uma instância singleton do serviço de API
export const apiService = new ApiService();

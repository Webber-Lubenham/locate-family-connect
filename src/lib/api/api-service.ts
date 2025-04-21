
import { supabase } from '../supabase';
import { toast } from '@/components/ui/use-toast';
import { recordApiError } from '../utils/cache-manager';

/**
 * Core API service for handling requests to the backend
 */
class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    // Get the Supabase URL from the environment instead of trying to use getUrl()
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    
    console.log('[API] Initializing API service with base URL:', url);
    this.baseUrl = url;
  }

  /**
   * Gets the singleton instance of the API service
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Shares a student's location via email
   */
  async shareLocation(email: string, latitude: number, longitude: number, studentName: string): Promise<boolean> {
    console.log(`[API] Sharing location to ${email} for ${studentName}: lat=${latitude}, long=${longitude}`);
    
    try {
      const { data, error } = await supabase.client.functions.invoke('share-location', {
        body: { email, latitude, longitude, studentName },
      });

      if (error) {
        console.error('[API] Share location error:', error);
        // Use error.status or a default status code if not available
        const statusCode = error.status || 500;
        recordApiError(statusCode, 'share-location');
        
        toast({
          title: 'Erro ao compartilhar localização',
          description: error.message || 'Não foi possível enviar sua localização',
          variant: 'destructive',
        });
        return false;
      }

      console.log('[API] Share location success:', data);
      toast({
        title: 'Localização compartilhada',
        description: `Sua localização foi enviada para ${email}`,
      });
      return true;
    } catch (error: any) {
      console.error('[API] Share location exception:', error);
      // Record error with a generic status code if actual is not available
      recordApiError(error.status || 500, 'share-location');
      toast({
        title: 'Erro ao compartilhar localização',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      return false;
    }
  }

  /**
   * Generic method to handle API error responses
   */
  handleApiError(error: any, endpoint: string): void {
    // Record the error for tracking
    if (error?.status) {
      recordApiError(error.status, endpoint);
    } else if (error?.code) {
      recordApiError(parseInt(error.code) || 500, endpoint);
    } else {
      recordApiError(500, endpoint);
    }
    
    // Special handling for common error codes
    if (error?.status === 406 || error?.code === '406') {
      toast({
        title: 'Erro de formato de dados',
        description: 'O servidor não pode processar o formato de dados solicitado. Tente limpar o cache.',
        variant: 'destructive',
      });
    } else if (error?.status === 403 || error?.code === '403') {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar este recurso. Verifique suas credenciais.',
        variant: 'destructive',
      });
    } else if (error?.status === 401 || error?.code === '401' || 
               error?.status === 'unauthorized' || error?.code === 'unauthorized') {
      toast({
        title: 'Erro de autenticação',
        description: 'Sua sessão pode ter expirado. Tente fazer login novamente.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erro de comunicação',
        description: 'Ocorreu um erro ao se comunicar com o servidor.',
        variant: 'destructive',
      });
    }
  }

  // Additional API methods can be added here
}

export const apiService = ApiService.getInstance();


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
    console.log(`[API] Compartilhando localização para ${email} de ${studentName}: lat=${latitude}, long=${longitude}`);
    
    try {
      // Validar dados antes de enviar
      if (!email || !email.includes('@')) {
        console.error('[API] Email inválido:', email);
        toast({
          title: 'Email inválido',
          description: 'Formato de email inválido.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error('[API] Coordenadas inválidas:', { latitude, longitude });
        toast({
          title: 'Dados de localização inválidos',
          description: 'Não foi possível obter coordenadas válidas.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!studentName) {
        studentName = 'Estudante'; // Nome padrão se não for fornecido
      }
      
      const payload = { email, latitude, longitude, studentName };
      console.log('[API] Enviando payload para Edge Function:', payload);
      
      const { data, error } = await supabase.client.functions.invoke('share-location', {
        body: payload,
      });

      if (error) {
        console.error('[API] Erro de compartilhamento de localização:', error);
        console.error('[API] Detalhes completos do erro:', JSON.stringify(error));
        
        // Use error.statusCode or a default status code if not available
        const statusCode = (typeof error.statusCode === 'number') ? error.statusCode : 500;
        recordApiError(statusCode, 'share-location');
        
        let errorMessage = error.message || 'Não foi possível enviar sua localização';
        
        // Verificar erros específicos do serviço de email
        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          errorMessage = 'Limite de emails excedido. Tente novamente em alguns minutos.';
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          errorMessage = 'Erro de autenticação no serviço de email. Contate o suporte.';
        } else if (errorMessage.includes('invalid') && errorMessage.includes('email')) {
          errorMessage = 'O email do destinatário parece ser inválido.';
        }
        
        toast({
          title: 'Erro ao compartilhar localização',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }

      console.log('[API] Compartilhamento bem-sucedido:', data);
      toast({
        title: 'Localização compartilhada',
        description: `Sua localização foi enviada para ${email}`,
      });
      return true;
    } catch (error: any) {
      console.error('[API] Exceção de compartilhamento de localização:', error);
      console.error('[API] Stack trace:', error.stack || 'não disponível');
      
      // Record error with a generic status code if actual is not available
      const statusCode = (typeof error.statusCode === 'number') ? error.statusCode : 500;
      recordApiError(statusCode, 'share-location');
      
      let errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
      
      // Verificar se o erro é de conexão
      if (errorMessage.includes('network') || errorMessage.includes('connection') || 
          errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      toast({
        title: 'Erro ao compartilhar localização',
        description: errorMessage,
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
    if (typeof error?.statusCode === 'number') {
      recordApiError(error.statusCode, endpoint);
    } else if (typeof error?.code === 'number') {
      recordApiError(error.code, endpoint);
    } else if (typeof error?.code === 'string' && !isNaN(parseInt(error.code))) {
      recordApiError(parseInt(error.code), endpoint);
    } else {
      recordApiError(500, endpoint);
    }
    
    // Special handling for common error codes
    if (error?.statusCode === 406 || error?.code === '406') {
      toast({
        title: 'Erro de formato de dados',
        description: 'O servidor não pode processar o formato de dados solicitado. Tente limpar o cache.',
        variant: 'destructive',
      });
    } else if (error?.statusCode === 403 || error?.code === '403') {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar este recurso. Verifique suas credenciais.',
        variant: 'destructive',
      });
    } else if (error?.statusCode === 401 || error?.code === '401' || 
               error?.statusCode === 'unauthorized' || error?.code === 'unauthorized') {
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

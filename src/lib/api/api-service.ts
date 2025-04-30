
import { supabase } from '../supabase';
import { toast } from '@/components/ui/use-toast';
import { recordApiError } from '../utils/cache-manager';

/**
 * Core API service for handling requests to the backend
 */
class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private emailRetryCount: Map<string, number> = new Map();
  private maxRetries = 2;

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
   * Shares a student's location via email with improved error handling and retries
   * @param isRequest If true, sends a request for location instead of sharing a location
   */
  async shareLocation(
    email: string, 
    latitude: number, 
    longitude: number, 
    senderName: string,
    isRequest: boolean = false
  ): Promise<boolean> {
    console.log(`[API] ${isRequest ? 'Solicitando' : 'Compartilhando'} localização para ${email} de ${senderName}: lat=${latitude}, long=${longitude}`);
    
    // Generate a unique key for this specific email+coordinates combination
    const emailKey = `${email}-${latitude}-${longitude}`;
    const currentRetryCount = this.emailRetryCount.get(emailKey) || 0;
    
    // Check if we've exceeded retry limit
    if (currentRetryCount >= this.maxRetries) {
      console.log(`[API] Limite de tentativas (${this.maxRetries}) excedido para ${emailKey}`);
      this.emailRetryCount.delete(emailKey); // Reset for future attempts
      
      toast({
        title: 'Muitas tentativas',
        description: `Muitas tentativas de envio para ${email}. Por favor, tente novamente mais tarde.`,
        variant: 'destructive',
      });
      
      return false;
    }
    
    // Increment retry count
    this.emailRetryCount.set(emailKey, currentRetryCount + 1);
    
    try {
      // Validate data before sending
      if (!email || !email.includes('@')) {
        console.error('[API] Email inválido:', email);
        toast({
          title: 'Email inválido',
          description: 'Formato de email inválido.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!isRequest && (isNaN(latitude) || isNaN(longitude))) {
        console.error('[API] Coordenadas inválidas:', { latitude, longitude });
        toast({
          title: 'Dados de localização inválidos',
          description: 'Não foi possível obter coordenadas válidas.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!senderName) {
        senderName = isRequest ? 'Responsável' : 'Estudante'; // Default name if not provided
      }
      
      const payload = { 
        email, 
        latitude, 
        longitude, 
        senderName,
        isRequest 
      };
      console.log('[API] Enviando payload para Edge Function:', payload);
      
      // Show sending toast
      toast({
        title: isRequest ? 'Enviando solicitação' : 'Enviando email',
        description: isRequest ? 
          `Solicitando localização de ${email}...` : 
          `Enviando localização para ${email}...`,
      });
      
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
        
        // Melhor tratamento para erros específicos do Resend
        if (error.message?.includes('domain is not verified') || error.statusText?.includes('Forbidden')) {
          console.log('[API] Erro de verificação de domínio no Resend - implementando fallback');
          errorMessage = 'Falha temporária no serviço de email. Tente novamente em alguns minutos.';
          
          // Informar ao administrador do sistema para verificar o domínio no Resend
          console.warn('[API] ATENÇÃO: O domínio locate-family-connect.lovable.app não está verificado no Resend. Visite https://resend.com/domains para verificar o domínio.');
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          errorMessage = 'Limite de emails excedido. Tente novamente em alguns minutos.';
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          errorMessage = 'Erro de autenticação no serviço de email. Contate o suporte.';
        } else if (errorMessage.includes('invalid') && errorMessage.includes('email')) {
          errorMessage = 'O email do destinatário parece ser inválido.';
        }
        
        toast({
          title: isRequest ? 'Erro ao solicitar localização' : 'Erro ao compartilhar localização',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }

      // Reset retry count on success
      this.emailRetryCount.delete(emailKey);
      
      console.log('[API] Compartilhamento bem-sucedido:', data);
      toast({
        title: isRequest ? 'Solicitação enviada' : 'Localização compartilhada',
        description: isRequest ? 
          `Sua solicitação foi enviada para ${email}` :
          `Sua localização foi enviada para ${email}`,
      });
      return true;
    } catch (error: any) {
      console.error('[API] Exceção de compartilhamento de localização:', error);
      console.error('[API] Stack trace:', error.stack || 'não disponível');
      
      // Record error with a generic status code if actual is not available
      const statusCode = (typeof error.statusCode === 'number') ? error.statusCode : 500;
      recordApiError(statusCode, 'share-location');
      
      let errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
      
      // Check for connection errors
      if (errorMessage.includes('network') || errorMessage.includes('connection') || 
          errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      toast({
        title: isRequest ? 'Erro ao solicitar localização' : 'Erro ao compartilhar localização',
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

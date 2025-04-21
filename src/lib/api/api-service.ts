
import { supabase } from '../supabase';
import { toast } from '@/components/ui/use-toast';

/**
 * Core API service for handling requests to the backend
 */
class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    // Get the Supabase URL from the environment instead of trying to use getUrl()
    const supabaseClient = supabase.client;
    
    // Use the environment URL instead of a method that doesn't exist
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
    } catch (error) {
      console.error('[API] Share location exception:', error);
      toast({
        title: 'Erro ao compartilhar localização',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      return false;
    }
  }

  // Additional API methods can be added here
}

export const apiService = ApiService.getInstance();

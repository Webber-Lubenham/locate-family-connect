
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export abstract class BaseService {
  protected supabase = supabase;
  
  protected showError(message: string): void {
    console.error(`[Service Error] ${message}`);
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive'
    });
  }
  
  protected showSuccess(message: string): void {
    toast({
      title: 'Sucesso',
      description: message
    });
  }
  
  protected async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error('Usuário não autenticado');
    }
    return user;
  }
  
  protected formatPhone(phone: string | null): string | null {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
  }
}

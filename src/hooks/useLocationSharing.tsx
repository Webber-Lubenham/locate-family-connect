
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export function useLocationSharing() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Share location with a guardian by email
   */
  const shareLocationByEmail = async (
    email: string,
    latitude: number,
    longitude: number,
    senderName: string
  ) => {
    if (!email) {
      toast({
        title: "Email não fornecido",
        description: "É necessário um email para compartilhar a localização",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);

    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para compartilhar sua localização",
          variant: "destructive"
        });
        return false;
      }

      // Invoke edge function
      const { data, error } = await supabase.functions.invoke('share-location', {
        body: {
          email,
          latitude,
          longitude,
          senderName,
          isRequest: false
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Localização compartilhada com ${email}`,
        variant: "default"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao compartilhar localização por email:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Não foi possível compartilhar sua localização",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request location from a student by email
   */
  const requestLocationByEmail = async (
    email: string,
    latitude: number,
    longitude: number,
    senderName: string
  ) => {
    if (!email) {
      toast({
        title: "Email não fornecido",
        description: "É necessário um email para solicitar a localização",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);

    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para solicitar localização",
          variant: "destructive"
        });
        return false;
      }

      // Invoke edge function
      const { data, error } = await supabase.functions.invoke('share-location', {
        body: {
          email,
          latitude,
          longitude,
          senderName,
          isRequest: true
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Solicitação de localização enviada para ${email}`,
        variant: "default"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao solicitar localização:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a solicitação",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    shareLocationByEmail,
    requestLocationByEmail
  };
}

import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";

export function useLocationSharing() {
  const [sharingStatus, setSharingStatus] = useState<{
    [guardianId: string]: {
      sharing: boolean;
      lastShared: Date | null;
      error: string | null;
    };
  }>({});
  const { toast } = useToast();
  const { user } = useUnifiedAuth();

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return 'Nunca compartilhado';
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  const shareLocation = async (guardianId: string, email: string, guardianName: string) => {
    setSharingStatus(prev => ({
      ...prev,
      [guardianId]: { sharing: true, lastShared: null, error: null }
    }));

    if (!navigator.geolocation) {
      setSharingStatus(prev => ({
        ...prev,
        [guardianId]: {
          sharing: false,
          lastShared: null,
          error: 'Geolocalização não suportada neste navegador.'
        }
      }));
      toast({
        title: "Erro",
        description: "Geolocalização não suportada neste navegador.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const { error } = await supabase
            .from('locations')
            .insert([
              {
                latitude,
                longitude,
                user_id: user?.id,
                guardian_id: guardianId,
                shared_by: user?.id
              }
            ]);

          if (error) {
            console.error('Erro ao salvar localização:', error);
            setSharingStatus(prev => ({
              ...prev,
              [guardianId]: { sharing: false, lastShared: null, error: error.message }
            }));
            toast({
              title: "Erro",
              description: "Não foi possível salvar a localização.",
              variant: "destructive"
            });
            return;
          }

          // Enviar email
          const emailResponse = await resendEmail(guardianId, email, guardianName);
          
          if (!emailResponse.success) {
            throw new Error(emailResponse.error || "Falha ao enviar email de localização");
          }

          setSharingStatus(prev => ({
            ...prev,
            [guardianId]: { sharing: false, lastShared: new Date(), error: null }
          }));
          toast({
            title: "Localização compartilhada",
            description: `Localização compartilhada com ${guardianName} (${email})`,
          });
        } catch (error: any) {
          console.error('Erro ao compartilhar localização:', error);
          setSharingStatus(prev => ({
            ...prev,
            [guardianId]: { sharing: false, lastShared: null, error: error.message }
          }));
          toast({
            title: "Erro",
            description: `Não foi possível compartilhar a localização: ${error.message}`,
            variant: "destructive"
          });
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        let errorMessage = 'Não foi possível obter a localização.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permissão de geolocalização negada. Verifique as configurações do seu navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Informação de localização indisponível.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Tempo limite para obter a localização excedido.';
        }
        setSharingStatus(prev => ({
          ...prev,
          [guardianId]: { sharing: false, lastShared: null, error: errorMessage }
        }));
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      }
    );
  };

  const resendEmail = async (guardianId: string, email: string, guardianName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('location-sharing', {
        body: {
          guardianId: guardianId,
          user_id: user?.id,
          email: email,
          guardianName: guardianName
        }
      });

      if (error) {
        console.error('Erro ao reenviar email:', error);
        toast({
          title: "Erro",
          description: `Não foi possível reenviar o email: ${error.message}`,
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Email reenviado",
        description: `Email reenviado para ${guardianName} (${email})`,
      });
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao reenviar email:', error);
      toast({
        title: "Erro",
        description: `Não foi possível reenviar o email: ${error.message}`,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  return {
    sharingStatus,
    formatRelativeTime,
    shareLocation,
    resendEmail
  };
}

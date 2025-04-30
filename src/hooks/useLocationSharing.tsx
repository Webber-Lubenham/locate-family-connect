
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { apiService } from '@/lib/api/api-service';
import { GuardianData } from '@/types/database';

export const useLocationSharing = (studentName: string) => {
  const [sharingStatus, setSharingStatus] = useState<Record<string, {status: string; error?: string}>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);
  const { toast } = useToast();

  const shareLocation = async (guardian: GuardianData) => {
    if ('geolocation' in navigator) {
      try {
        setSharingStatus(prev => ({
          ...prev,
          [guardian.id]: { status: 'loading' }
        }));

        // Get current position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        console.log(`Fetching location for ${guardian.email}:`, latitude, longitude);

        // First check if the user is authenticated
        const { data: { session } } = await supabase.client.auth.getSession();
        
        if (!session) {
          console.error('User not authenticated');
          setSharingStatus(prev => ({
            ...prev,
            [guardian.id]: { status: 'error', error: 'Usuário não autenticado' }
          }));
          
          toast({
            title: "Erro de Autenticação",
            description: "Você precisa estar logado para compartilhar sua localização",
            variant: "destructive"
          });
          
          return false;
        }

        // Save the location to the database with the RPC function to avoid RLS issues
        // Use type assertion to bypass the TypeScript error
        const { data: locationData, error: locationError } = await supabase.client
          .rpc('save_student_location' as any, { 
            p_latitude: latitude,
            p_longitude: longitude,
            p_shared_with_guardians: true
          });

        if (locationError) {
          console.error('Error saving location:', locationError);
          setSharingStatus(prev => ({
            ...prev,
            [guardian.id]: { status: 'error', error: 'Erro ao salvar localização' }
          }));
          
          toast({
            title: "Erro",
            description: `Não foi possível salvar sua localização: ${locationError.message}`,
            variant: "destructive"
          });
          
          return false;
        }

        console.log('Location saved successfully:', locationData);

        // Now share via email
        const success = await apiService.shareLocation(
          guardian.email, 
          latitude, 
          longitude, 
          studentName
        );

        if (success) {
          setSharingStatus(prev => ({
            ...prev,
            [guardian.id]: { status: 'success' }
          }));
          return true;
        } else {
          setSharingStatus(prev => ({
            ...prev,
            [guardian.id]: { status: 'error', error: 'Falha ao enviar email' }
          }));
          return false;
        }
      } catch (err: any) {
        console.error('Error sharing location:', err);
        setSharingStatus(prev => ({
          ...prev,
          [guardian.id]: { status: 'error', error: err.message }
        }));
        
        toast({
          title: "Erro",
          description: err.message || "Erro ao compartilhar localização",
          variant: "destructive"
        });
        
        return false;
      }
    } else {
      toast({
        title: "Geolocalização não disponível",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      
      setSharingStatus(prev => ({
        ...prev,
        [guardian.id]: { status: 'error', error: 'Geolocalização não suportada' }
      }));
      
      return false;
    }
  };

  const shareLocationAll = async (guardians: GuardianData[]) => {
    if (guardians.length === 0) {
      toast({
        title: "Nenhum responsável",
        description: "Adicione pelo menos um responsável para compartilhar sua localização",
        variant: "destructive"
      });
      return;
    }

    if ('geolocation' in navigator) {
      setIsSendingAll(true);

      try {
        // Get position once for all guardians
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        console.log(`Got location for all guardians:`, latitude, longitude);

        // Check if user is authenticated
        const { data: { session } } = await supabase.client.auth.getSession();
        
        if (!session) {
          console.error('User not authenticated');
          toast({
            title: "Erro de Autenticação",
            description: "Você precisa estar logado para compartilhar sua localização",
            variant: "destructive"
          });
          setIsSendingAll(false);
          return false;
        }

        // Save the location to the database with the RPC function
        // Use type assertion to bypass the TypeScript error
        const { data: locationData, error: locationError } = await supabase.client
          .rpc('save_student_location' as any, { 
            p_latitude: latitude, 
            p_longitude: longitude,
            p_shared_with_guardians: true
          });

        if (locationError) {
          console.error('Error saving location:', locationError);
          toast({
            title: "Erro",
            description: `Não foi possível salvar sua localização: ${locationError.message}`,
            variant: "destructive"
          });
          setIsSendingAll(false);
          return false;
        }

        console.log('Location saved successfully for all guardians:', locationData);

        // Then share via email with all guardians
        const results = await Promise.all(
          guardians.map(async (guardian) => {
            const success = await apiService.shareLocation(
              guardian.email,
              latitude,
              longitude,
              studentName
            );
            
            setSharingStatus(prev => ({
              ...prev,
              [guardian.id]: { status: success ? 'success' : 'error' }
            }));
            
            return success;
          })
        );

        const allSuccessful = results.every(r => r === true);
        if (allSuccessful) {
          toast({
            title: "Localização compartilhada",
            description: `Localização enviada para ${guardians.length} responsáveis`,
          });
        } else {
          toast({
            title: "Atenção",
            description: `${results.filter(r => r === true).length} de ${guardians.length} envios foram bem-sucedidos`,
            variant: "destructive" 
          });
        }
        
        return allSuccessful;
      } catch (err: any) {
        console.error('Error in shareLocationAll:', err);
        toast({
          title: "Erro",
          description: err.message || "Erro ao compartilhar localização",
          variant: "destructive"
        });
        return false;
      } finally {
        setIsSendingAll(false);
      }
    } else {
      toast({
        title: "Geolocalização não disponível",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    sharingStatus,
    isSendingAll,
    shareLocation,
    shareLocationAll
  };
};

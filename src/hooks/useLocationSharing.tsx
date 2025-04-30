
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

        // First save the location to the database
        const { data: locationData, error: locationError } = await supabase.client
          .from('locations')
          .insert([
            { 
              user_id: guardian.student_id, // This is the student's ID
              latitude, 
              longitude,
              shared_with_guardians: true
            }
          ])
          .select('id')
          .single();

        if (locationError) {
          console.error('Error saving location:', locationError);
          setSharingStatus(prev => ({
            ...prev,
            [guardian.id]: { status: 'error', error: 'Erro ao salvar localização' }
          }));
          
          toast({
            title: "Erro",
            description: "Não foi possível salvar sua localização no banco de dados",
            variant: "destructive"
          });
          
          return false;
        }

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

        // First save the location to the database - just once
        const { data: locationData, error: locationError } = await supabase.client
          .from('locations')
          .insert([
            { 
              user_id: guardians[0]?.student_id, // All guardians have the same student_id
              latitude, 
              longitude,
              shared_with_guardians: true
            }
          ])
          .select('id')
          .single();

        if (locationError) {
          console.error('Error saving location:', locationError);
          toast({
            title: "Erro",
            description: "Não foi possível salvar sua localização no banco de dados",
            variant: "destructive"
          });
          setIsSendingAll(false);
          return false;
        }

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
            // Fixed this line to use "destructive" instead of "warning"
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

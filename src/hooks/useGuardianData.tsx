import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { GuardianData } from '@/types/database';

interface UseGuardianDataResult {
  guardians: GuardianData[];
  loading: boolean;
  error: string | null;
  addGuardian: (guardian: Partial<GuardianData>) => Promise<void>;
  deleteGuardian: (id: string) => Promise<void>;
  shareLocationWithGuardian: (guardian: GuardianData) => Promise<void>;
  sharingStatus: Record<string, string>;
  refreshGuardians: () => Promise<void>;
}

export function useGuardianData(): UseGuardianDataResult {
  const [guardians, setGuardians] = useState<GuardianData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchGuardians = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }
      
      const { data: guardiansData, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', user.id)
        .eq('is_active', true);
      
      if (error) {
        throw error;
      }
      
      if (!guardiansData) {
        setGuardians([]);
      } else {
        setGuardians(guardiansData);
      }
    } catch (error: any) {
      setError(error.message || "Não foi possível carregar os responsáveis");
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível carregar os responsáveis"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addGuardian = useCallback(async (guardian: Partial<GuardianData>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }
      
      // Validate email
      if (!guardian.email) {
        throw new Error("Email do responsável é obrigatório");
      }

      // Check if guardian relationship already exists
      const { data: existingGuardian, error: checkError } = await supabase
        .from('guardians')
        .select('id')
        .eq('student_id', user.id)
        .eq('email', guardian.email.toLowerCase())
        .eq('is_active', true);
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingGuardian && existingGuardian.length > 0) {
        toast({
          title: "Aviso",
          description: "Este responsável já está cadastrado.",
        });
        setLoading(false);
        return;
      }
      
      // Create the guardian relationship
      const { error: insertError } = await supabase
        .from('guardians')
        .insert({
          student_id: user.id,
          guardian_id: null, // Will be linked when the guardian registers
          email: guardian.email.toLowerCase(),
          full_name: guardian.full_name || null,
          phone: guardian.phone || null,
          is_active: true
        });

      if (insertError) {
        throw insertError;
      }
      
      await fetchGuardians();
    } catch (error: any) {
      setError(error.message || "Não foi possível adicionar o responsável");
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível adicionar o responsável"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, fetchGuardians]);

  const deleteGuardian = useCallback(async (guardianId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      // Mark as inactive rather than delete
      const { error } = await supabase
        .from('guardians')
        .update({ is_active: false })
        .eq('id', guardianId)
        .eq('student_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Responsável removido",
        description: "O responsável foi removido com sucesso."
      });
      
      await fetchGuardians();
    } catch (error: any) {
      setError(error.message || "Não foi possível remover o responsável");
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível remover o responsável"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, fetchGuardians]);

  const shareLocationWithGuardian = useCallback(async (guardian: GuardianData) => {
    setSharingStatus(prev => ({ ...prev, [guardian.id]: 'loading' }));
    try {
      // Get current location
      let coords: GeolocationCoordinates | null = null;
      
      try {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            position => resolve(position.coords),
            error => reject(error)
          );
        });
      } catch (error: any) {
        toast({
          title: "Erro de localização",
          description: error.message || "Não foi possível obter sua localização",
          variant: "destructive"
        });
        setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
        return;
      }
      
      // Save location to database
      const { data: locationData, error: locationError } = await supabase.rpc('save_student_location', {
        p_latitude: coords.latitude,
        p_longitude: coords.longitude,
        p_shared_with_guardians: true
      });
      
      if (locationError) {
        throw locationError;
      }
      
      // Send email
      const { error: emailError } = await supabase.functions.invoke('notify-guardian', {
        body: { 
          guardianId: guardian.id,
          latitude: coords.latitude,
          longitude: coords.longitude,
          locationId: locationData
        }
      });
      
      if (emailError) {
        throw emailError;
      }
      
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'success' }));
      
      setTimeout(() => {
        setSharingStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[guardian.id];
          return newStatus;
        });
      }, 3000);
      
      return true;
    } catch (error: any) {
      setError(error.message || "Não foi possível compartilhar a localização com o responsável");
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível compartilhar a localização com o responsável"
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    fetchGuardians();
  }, [fetchGuardians]);

  return {
    guardians,
    loading,
    error,
    addGuardian,
    deleteGuardian,
    shareLocationWithGuardian,
    sharingStatus,
    refreshGuardians: fetchGuardians
  };
}

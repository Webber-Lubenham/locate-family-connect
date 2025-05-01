import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface UseLocationSaveProps {
  userId?: string;
  onSaved?: () => void;
}

export const useLocationSave = ({ userId, onSaved }: UseLocationSaveProps = {}) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveLocation = async (latitude: number, longitude: number) => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.client.rpc('save_student_location', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_shared_with_guardians: true
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Localização salva com sucesso",
        variant: "default"
      });

      onSaved?.();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar localização",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveLocation
  };
}; 
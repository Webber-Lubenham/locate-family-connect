
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddGuardianForm from './AddGuardianForm';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface AddGuardianDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardianAdded: () => void;
}

const AddGuardianDialog: React.FC<AddGuardianDialogProps> = ({
  isOpen,
  onOpenChange,
  onGuardianAdded
}) => {
  const { toast } = useToast();

  const handleSubmit = async (values: { email: string; name?: string; phone?: string }) => {
    try {
      // Insert the new guardian
      const { error } = await supabase
        .from('guardians')
        .insert({
          full_name: values.name || 'Responsável',
          email: values.email,
          phone: values.phone || null,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Responsável adicionado com sucesso"
      });

      onGuardianAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding guardian:', error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível adicionar o responsável",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Responsável</DialogTitle>
          <DialogDescription>
            Adicione um responsável para compartilhar sua localização.
          </DialogDescription>
        </DialogHeader>
        <AddGuardianForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default AddGuardianDialog;

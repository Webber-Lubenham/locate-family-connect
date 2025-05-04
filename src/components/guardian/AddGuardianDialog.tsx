
import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from '@/contexts/UnifiedAuthContext';

interface AddGuardianDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onGuardianAdded: () => void;
}

const AddGuardianDialog: React.FC<AddGuardianDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onGuardianAdded
}) => {
  const [newGuardian, setNewGuardian] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGuardian(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    const digits = phone.replace(/\D/g, '');
    
    if (digits.startsWith('55') || digits.length === 11 || digits.length === 10) {
      if (!digits.startsWith('55')) {
        return '+55' + digits;
      }
      return '+' + digits;
    }
    
    if (digits.startsWith('44') || digits.length === 10 || digits.length === 11) {
      if (!digits.startsWith('44')) {
        return '+44' + digits;
      }
      return '+' + digits;
    }
    
    return '+' + digits;
  };

  const addGuardian = async () => {
    if (!newGuardian.full_name || !newGuardian.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const formattedPhone = newGuardian.phone ? formatPhoneNumber(newGuardian.phone) : undefined;
      
      const guardianData = {
        full_name: newGuardian.full_name,
        email: newGuardian.email,
        phone: formattedPhone,
        student_id: user?.id
      };

      console.log('Adicionando responsável:', guardianData);

      const { data, error } = await supabase
        .from('guardians')
        .insert([guardianData])
        .select();

      if (error) {
        console.error('Error adding guardian:', error);
        throw error;
      }

      console.log('Responsável adicionado com sucesso:', data);

      toast({
        title: "Sucesso",
        description: "Responsável adicionado com sucesso"
      });

      setNewGuardian({ full_name: '', email: '', phone: '' });
      onOpenChange(false);
      onGuardianAdded();
    } catch (error: any) {
      console.error('Error adding guardian:', error);
      
      let errorMessage = "Não foi possível adicionar o responsável";
      if (error?.code === '42P01') {
        errorMessage = "A tabela de responsáveis ainda não existe. Execute a migração do banco de dados para criar a tabela.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Responsável</DialogTitle>
          <DialogDescription>
            Adicione um novo responsável para compartilhar sua localização
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              name="full_name"
              value={newGuardian.full_name}
              onChange={handleInputChange}
              placeholder="Nome do responsável"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={newGuardian.email}
              onChange={handleInputChange}
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              name="phone"
              value={newGuardian.phone}
              onChange={handleInputChange}
              placeholder="+55 (DDD) XXXXX-XXXX ou +44 XXXX XXX XXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: Brasil (+55) e Reino Unido (+44)
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button onClick={addGuardian} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              "Adicionar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGuardianDialog;

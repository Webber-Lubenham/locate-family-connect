
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { apiService } from '@/lib/api/api-service';
import { useUser } from '@/contexts/UserContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Guardian {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

const GuardianList = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGuardians, setIsLoadingGuardians] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuardian, setNewGuardian] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  // Fetch guardians on component mount
  useEffect(() => {
    if (user?.id) {
      console.log('[DB] Accessing table: guardians');
      fetchGuardians();
    }
  }, [user?.id]);

  const fetchGuardians = async () => {
    setIsLoadingGuardians(true);
    setError(null);
    
    try {
      // Try to access the guardians table
      const { data, error } = await supabase.client
        .from('guardians')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching guardians:', error);
        
        // Provide more specific error message based on error code
        if (error.code === '42P01') {
          setError('A tabela de responsáveis ainda não existe. Execute a migração do banco de dados para criar a tabela.');
        } else {
          setError('Não foi possível carregar os responsáveis: ' + error.message);
        }
        setGuardians([]);
      } else {
        console.log('Guardians loaded:', data);
        setGuardians(data || []);
      }
    } catch (error) {
      console.error('Error fetching guardians:', error);
      setError('Erro ao buscar os responsáveis');
      setGuardians([]);
    } finally {
      setIsLoadingGuardians(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGuardian(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Função para formatar números de telefone do Brasil e UK
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Remove todos os caracteres não-numéricos
    const digits = phone.replace(/\D/g, '');
    
    // Verifica se é um número brasileiro (começa com +55 ou tem formato BR)
    if (digits.startsWith('55') || digits.length === 11 || digits.length === 10) {
      // Se não começar com código do país, adiciona +55
      if (!digits.startsWith('55')) {
        return '+55' + digits;
      }
      return '+' + digits;
    }
    
    // Verifica se é um número do Reino Unido (começa com +44 ou 44)
    if (digits.startsWith('44') || digits.length === 10 || digits.length === 11) {
      // Se não começar com código do país, adiciona +44
      if (!digits.startsWith('44')) {
        return '+44' + digits;
      }
      return '+' + digits;
    }
    
    // Se não identificar um padrão específico, retorna o número com + no início
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
      // Formata o número de telefone se fornecido
      const formattedPhone = newGuardian.phone ? formatPhoneNumber(newGuardian.phone) : undefined;
      
      const guardianData = {
        full_name: newGuardian.full_name,
        email: newGuardian.email,
        phone: formattedPhone,
        student_id: user?.id
      };

      console.log('Adicionando responsável:', guardianData);

      const { data, error } = await supabase.client
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
      setIsDialogOpen(false);
      fetchGuardians();
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

  const deleteGuardian = async (id: string) => {
    try {
      const { error } = await supabase.client
        .from('guardians')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Responsável removido com sucesso"
      });

      fetchGuardians();
    } catch (error: any) {
      console.error('Error deleting guardian:', error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível remover o responsável",
        variant: "destructive"
      });
    }
  };

  const shareLocation = async (email: string, guardianName: string) => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Obtendo localização",
      description: "Aguarde enquanto obtemos sua localização..."
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiService.shareLocation(
            email,
            position.coords.latitude,
            position.coords.longitude,
            guardianName
          );

          toast({
            title: "Localização compartilhada",
            description: `Localização enviada para ${guardianName}`
          });
        } catch (error) {
          console.error('Error sharing location:', error);
          toast({
            title: "Erro",
            description: "Não foi possível compartilhar sua localização",
            variant: "destructive"
          });
        }
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast({
          title: "Erro",
          description: "Não foi possível obter sua localização",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Meus Responsáveis</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Responsável
            </Button>
          </DialogTrigger>
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
            </div>
            <DialogFooter>
              <Button onClick={addGuardian} disabled={isLoading}>
                {isLoading ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingGuardians ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : guardians.length === 0 ? (
        <div className="text-center p-6 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {error ? 'Não foi possível carregar os responsáveis' : 'Você ainda não adicionou nenhum responsável.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {guardians.map((guardian) => (
            <div
              key={guardian.id}
              className="flex items-center justify-between p-4 bg-card rounded-lg border"
            >
              <div>
                <h3 className="font-medium">{guardian.full_name}</h3>
                <p className="text-sm text-muted-foreground">{guardian.email}</p>
                {guardian.phone && (
                  <p className="text-sm text-muted-foreground">{guardian.phone}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareLocation(guardian.email, guardian.full_name)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Enviar Localização
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteGuardian(guardian.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuardianList;

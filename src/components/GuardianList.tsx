
import React, { useState } from 'react';
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

interface Guardian {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

const GuardianList = () => {
  const [guardians, setGuardians] = React.useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newGuardian, setNewGuardian] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

  // Fetch guardians on component mount
  React.useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuardians(data || []);
    } catch (error) {
      console.error('Error fetching guardians:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os responsáveis",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGuardian(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
    try {
      const { error } = await supabase
        .from('guardians')
        .insert([newGuardian]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Responsável adicionado com sucesso"
      });

      setNewGuardian({ full_name: '', email: '', phone: '' });
      fetchGuardians();
    } catch (error) {
      console.error('Error adding guardian:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o responsável",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGuardian = async (id: string) => {
    try {
      const { error } = await supabase
        .from('guardians')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Responsável removido com sucesso"
      });

      fetchGuardians();
    } catch (error) {
      console.error('Error deleting guardian:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o responsável",
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
        console.error('Geolocation error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível obter sua localização",
          variant: "destructive"
        });
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Meus Responsáveis</h2>
        <Dialog>
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
                  placeholder="(00) 00000-0000"
                />
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
    </div>
  );
};

export default GuardianList;

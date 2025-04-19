
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, UserCheck, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { profile, signOut } = useUser();
  const { toast } = useToast();
  const [guardians, setGuardians] = React.useState([]);
  const [newGuardianEmail, setNewGuardianEmail] = React.useState("");
  const [newGuardianPhone, setNewGuardianPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    if (profile?.user_type !== 'student') return;

    const { data, error } = await supabase
      .from('guardians')
      .select('*')
      .eq('student_id', profile.id);

    if (!error && data) {
      setGuardians(data);
    }
  };

  const addGuardian = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('guardians').insert({
        student_id: profile?.id,
        email: newGuardianEmail,
        phone: newGuardianPhone
      });

      if (error) throw error;

      toast({
        title: "Responsável adicionado",
        description: "O responsável foi adicionado com sucesso.",
      });

      fetchGuardians();
      setNewGuardianEmail("");
      setNewGuardianPhone("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o responsável.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteGuardian = async (guardianId: string) => {
    try {
      const { error } = await supabase
        .from('guardians')
        .delete()
        .eq('id', guardianId);

      if (error) throw error;

      toast({
        title: "Responsável removido",
        description: "O responsável foi removido com sucesso.",
      });

      fetchGuardians();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o responsável.",
        variant: "destructive",
      });
    }
  };

  const shareLocation = async (guardianEmail: string) => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        // Get the session using the correct method
        const { data: { session } } = await supabase.client.auth.getSession();
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({
            email: guardianEmail,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            studentName: profile?.full_name
          })
        });
        
        if (!response.ok) throw new Error('Falha ao enviar a localização');
        
        const data = await response.json();

        toast({
          title: "Localização compartilhada",
          description: "Sua localização foi enviada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar sua localização.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {profile?.full_name || 'Usuário'}!</h1>
          <p className="text-muted-foreground">
            Acesse as informações e recursos do EduConnect.
          </p>
        </div>
        <Button variant="destructive" onClick={signOut}>Sair</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profile?.user_type === 'student' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Minha Localização</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Localização Ativa</div>
                <p className="text-xs text-muted-foreground">
                  Sua localização está sendo compartilhada com seus responsáveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Responsável</DialogTitle>
                        <DialogDescription>
                          Adicione um novo responsável para compartilhar sua localização.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label>Email do Responsável</label>
                          <Input
                            value={newGuardianEmail}
                            onChange={(e) => setNewGuardianEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label>Telefone do Responsável</label>
                          <Input
                            value={newGuardianPhone}
                            onChange={(e) => setNewGuardianPhone(e.target.value)}
                            placeholder="+55 (11) 98765-4321"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addGuardian} disabled={loading}>
                          {loading ? "Adicionando..." : "Adicionar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guardians.map((guardian) => (
                    <div key={guardian.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">{guardian.email}</p>
                        <p className="text-sm text-muted-foreground">{guardian.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareLocation(guardian.email)}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Enviar Localização
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteGuardian(guardian.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 Estudantes</div>
                <p className="text-xs text-muted-foreground">
                  Estudantes vinculados ao seu perfil
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

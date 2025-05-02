import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UnifiedAuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, Trash2, RefreshCw, Mail, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Tipo para responsável
type Guardian = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

const GuardiansPage = () => {
  const { user } = useUser();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddGuardian, setShowAddGuardian] = useState(false);
  
  // Estados para o formulário
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<'BR' | 'UK' | 'US' | 'PT'>('BR');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para navegar de volta ao dashboard
  const goBackToDashboard = () => {
    const userType = user?.user_metadata?.user_type || 'student';
    if (userType === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  // Função para buscar os responsáveis do estudante
  const fetchGuardians = async () => {
    if (!user?.id) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os responsáveis do estudante
      const { data, error } = await supabase.client
        .from("guardians")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar responsáveis:", error);
        setError("Não foi possível carregar seus responsáveis");
        return;
      }

      setGuardians(data || []);
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      setError("Ocorreu um erro ao processar os dados dos responsáveis");
    } finally {
      setLoading(false);
    }
  };

  // Buscar responsáveis ao carregar o componente
  useEffect(() => {
    fetchGuardians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  
  // Função de formatação de telefone baseada no país selecionado
  const formatPhoneNumber = (phone: string, country: 'BR' | 'UK' | 'US' | 'PT') => {
    // Remove todos os caracteres não-numéricos, exceto '+'
    const digits = phone.replace(/[^\d+]/g, '');
    
    // Certifique-se de que só há um '+' no início
    let formattedPhone = digits;
    if (formattedPhone.includes('+')) {
      formattedPhone = '+' + formattedPhone.replace(/\+/g, '');
    }
    
    // Aplicar formatação específica por país
    switch (country) {
      case 'BR':
        // Adicionar prefixo +55 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+55' + formattedPhone;
        }
        
        // Formato: +55 (XX) XXXXX-XXXX
        // Extrair partes do número
        const brDigits = formattedPhone.replace(/\+55/g, '').replace(/\D/g, '');
        if (brDigits.length >= 2) {
          const ddd = brDigits.substring(0, 2);
          const firstPart = brDigits.substring(2, 7);
          const secondPart = brDigits.substring(7, 11);
          
          // Construir número formatado
          formattedPhone = `+55 (${ddd})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += `-${secondPart}`;
        }
        break;
        
      case 'UK':
        // Adicionar prefixo +44 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+44' + formattedPhone;
        }
        
        // Formato: +44 (XX) XXXX XXXX
        // Extrair partes do número
        const ukDigits = formattedPhone.replace(/\+44/g, '').replace(/\D/g, '');
        if (ukDigits.length >= 2) {
          const areaCode = ukDigits.substring(0, 2);
          const firstPart = ukDigits.substring(2, 6);
          const secondPart = ukDigits.substring(6, 10);
          
          // Construir número formatado
          formattedPhone = `+44 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += ` ${secondPart}`;
        }
        break;
        
      case 'US':
        // Adicionar prefixo +1 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+1' + formattedPhone;
        }
        
        // Formato: +1 (XXX) XXX-XXXX
        // Extrair partes do número
        const usDigits = formattedPhone.replace(/\+1/g, '').replace(/\D/g, '');
        if (usDigits.length >= 3) {
          const areaCode = usDigits.substring(0, 3);
          const firstPart = usDigits.substring(3, 6);
          const secondPart = usDigits.substring(6, 10);
          
          // Construir número formatado
          formattedPhone = `+1 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += `-${secondPart}`;
        }
        break;
        
      case 'PT':
        // Adicionar prefixo +351 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+351' + formattedPhone;
        }
        
        // Formato: +351 XXX XXX XXX
        // Extrair partes do número
        const ptDigits = formattedPhone.replace(/\+351/g, '').replace(/\D/g, '');
        if (ptDigits.length >= 3) {
          const firstPart = ptDigits.substring(0, 3);
          const secondPart = ptDigits.substring(3, 6);
          const thirdPart = ptDigits.substring(6, 9);
          
          // Construir número formatado
          formattedPhone = '+351';
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += ` ${secondPart}`;
          if (thirdPart) formattedPhone += ` ${thirdPart}`;
        }
        break;
    }
    
    return formattedPhone;
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue, phoneCountry);
    setNewGuardianPhone(formattedValue);
  };
  
  // Função para alterar o país e reformatar o telefone
  const handlePhoneCountryChange = (newCountry: 'BR' | 'UK' | 'US' | 'PT') => {
    setPhoneCountry(newCountry);
    // Reformatar o telefone existente para o novo formato de país
    const reformattedPhone = formatPhoneNumber(newGuardianPhone, newCountry);
    setNewGuardianPhone(reformattedPhone);
  };

  // Função para adicionar um novo responsável
  const addGuardian = async () => {
    if (!user?.id) {
      setFormError("Usuário não autenticado");
      return;
    }

    // Validar email
    if (!newGuardianEmail || !newGuardianEmail.includes("@")) {
      setFormError("Email do responsável é obrigatório e deve ser válido");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      
      // Verificar se já existe um responsável com este email
      const { data: existingGuardian } = await supabase.client
        .from("guardians")
        .select("id")
        .eq("student_id", user.id)
        .eq("email", newGuardianEmail.trim().toLowerCase());
      
      if (existingGuardian && existingGuardian.length > 0) {
        setFormError("Este responsável já está vinculado à sua conta");
        return;
      }
      
      // Garantir que o telefone esteja limpo antes de salvar
      const cleanPhone = newGuardianPhone.trim();
      
      // Adicionar o novo responsável
      const { data, error } = await supabase.client
        .from("guardians")
        .insert([
          {
            student_id: user.id,
            email: newGuardianEmail.trim().toLowerCase(),
            full_name: newGuardianName.trim() || null,
            phone: cleanPhone || null,
            is_active: true
          }
        ]);

      if (error) {
        console.error("Erro ao adicionar responsável:", error);
        setFormError(error.message || "Erro ao adicionar responsável");
        return;
      }

      // Fechar o modal e atualizar a lista
      setShowAddGuardian(false);
      fetchGuardians();
      
      // Limpar o formulário
      setNewGuardianEmail("");
      setNewGuardianName("");
      setNewGuardianPhone("");
      
      toast({
        title: "Responsável adicionado com sucesso",
        description: "O responsável foi vinculado à sua conta",
      });
    } catch (err: any) {
      console.error("Erro ao adicionar responsável:", err);
      setFormError(err.message || "Erro ao adicionar responsável");
    } finally {
      setSubmitting(false);
    }
  };

  // Função para remover um responsável
  const removeGuardian = async (guardianId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      const { error } = await supabase.client
        .from("guardians")
        .delete()
        .eq("id", guardianId)
        .eq("student_id", user.id);

      if (error) {
        console.error("Erro ao remover responsável:", error);
        toast({
          title: "Erro ao remover responsável",
          description: error.message || "Não foi possível remover o responsável",
          variant: "destructive",
        });
        return;
      }

      // Atualizar a lista
      fetchGuardians();
      
      toast({
        title: "Responsável removido",
        description: "O responsável foi desvinculado da sua conta",
      });
    } catch (err: any) {
      console.error("Erro ao remover responsável:", err);
      toast({
        title: "Erro ao remover responsável",
        description: err.message || "Ocorreu um erro ao remover o responsável",
        variant: "destructive",
      });
    }
  };

  // Função para enviar email de convite para o responsável
  const sendInviteEmail = async (guardianEmail: string, guardianName: string | null) => {
    if (!user?.id) {
      return;
    }

    try {
      const recipientName = guardianName || "Responsável";
      const studentName = user.user_metadata?.full_name || "Estudante";
      
      // URL para onde o responsável será direcionado
      const registrationUrl = `${window.location.origin}/register`;
      
      // Chamar API para enviar email
      const { error } = await supabase.client.functions.invoke("invite-guardian", {
        body: {
          to: guardianEmail,
          subject: `Convite para acompanhar ${studentName} no EduConnect`,
          recipientName,
          studentName,
          registrationUrl
        }
      });

      if (error) {
        console.error("Erro ao enviar convite:", error);
        toast({
          title: "Erro ao enviar convite",
          description: "Não foi possível enviar o email de convite",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Convite enviado",
        description: `Um email de convite foi enviado para ${guardianEmail}`,
      });
    } catch (err: any) {
      console.error("Erro ao enviar convite:", err);
      toast({
        title: "Erro ao enviar convite",
        description: err.message || "Ocorreu um erro ao enviar o convite",
        variant: "destructive",
      });
    }
  };

  // Verifica se o usuário está autenticado - REMOVEMOS a verificação de tipo de usuário
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            Você precisa estar autenticado para acessar esta página.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/login")}>Ir para Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Botão de voltar */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goBackToDashboard} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Responsáveis</h1>
          <p className="text-muted-foreground">
            Gerencie as pessoas responsáveis que podem acompanhar sua localização
          </p>
        </div>
        <Button onClick={() => setShowAddGuardian(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Responsável
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeletons para carregamento
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : guardians.length === 0 ? (
          <Card className="col-span-full p-6">
            <CardContent className="flex flex-col items-center justify-center pt-6 pb-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum responsável cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione seus responsáveis para que eles possam acompanhar sua localização
              </p>
              <Button onClick={() => setShowAddGuardian(true)}>
                Adicionar Responsável
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Lista de responsáveis
          guardians.map((guardian) => (
            <Card key={guardian.id}>
              <CardHeader>
                <CardTitle>{guardian.full_name || "Responsável"}</CardTitle>
                <CardDescription className="flex items-center">
                  {guardian.email}
                  {guardian.is_active ? (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                      Ativo
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                      Pendente
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {guardian.phone && (
                    <p>Telefone: {guardian.phone}</p>
                  )}
                  <p>Adicionado em: {new Date(guardian.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendInviteEmail(guardian.email, guardian.full_name)}
                >
                  <Mail className="mr-2 h-4 w-4" /> Convidar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeGuardian(guardian.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remover
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Modal para adicionar responsável */}
      <Dialog open={showAddGuardian} onOpenChange={setShowAddGuardian}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Responsável</DialogTitle>
            <DialogDescription>
              Adicione uma pessoa responsável para acompanhar sua localização.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Responsável *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={newGuardianEmail}
                onChange={(e) => setNewGuardianEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Responsável</Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={newGuardianName}
                onChange={(e) => setNewGuardianName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone do Responsável</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button 
                    type="button" 
                    variant={phoneCountry === 'BR' ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handlePhoneCountryChange('BR')}
                  >
                    🇧🇷 +55
                  </Button>
                  <Button 
                    type="button" 
                    variant={phoneCountry === 'UK' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handlePhoneCountryChange('UK')}
                  >
                    🇬🇧 +44
                  </Button>
                  <Button 
                    type="button" 
                    variant={phoneCountry === 'US' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handlePhoneCountryChange('US')}
                  >
                    🇺🇸 +1
                  </Button>
                  <Button 
                    type="button" 
                    variant={phoneCountry === 'PT' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handlePhoneCountryChange('PT')}
                  >
                    🇵🇹 +351
                  </Button>
                </div>
                <Input
                  id="phone"
                  placeholder={
                    phoneCountry === 'BR' ? "+55 (XX) XXXXX-XXXX" :
                    phoneCountry === 'UK' ? "+44 (XX) XXXX XXXX" :
                    phoneCountry === 'US' ? "+1 (XXX) XXX-XXXX" :
                    "+351 XXX XXX XXX"
                  }
                  value={newGuardianPhone}
                  onChange={handlePhoneChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione o país e digite o número no formato indicado
              </p>
            </div>

            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGuardian(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addGuardian} 
              disabled={submitting || !newGuardianEmail}
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuardiansPage;

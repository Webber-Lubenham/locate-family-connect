import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, RefreshCw, UserCheck, Users, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Tipo para estudante
type Student = {
  id: string;
  email: string;
  full_name: string | null;
  is_verified: boolean;
  added_at: string;
};

const AddStudentPage = () => {
  const { user, profile } = useUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Estados para o formulário
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para buscar os estudantes do responsável
  const fetchStudents = async () => {
    if (!user?.email) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar usando a função SQL get_guardian_students
      const { data, error } = await supabase.client
        .rpc('get_guardian_students', { guardian_email: user.email });

      if (error) {
        console.error("Erro ao buscar estudantes:", error);
        setError("Não foi possível carregar seus estudantes");
        
        // Tentativa alternativa: buscar diretamente da tabela guardians
        const { data: guardiansData, error: guardiansError } = await supabase.client
          .from('guardians')
          .select(`
            student_id,
            is_active,
            created_at
          `)
          .eq('email', user.email)
          .eq('is_active', true);
          
        if (guardiansError) {
          console.error("Erro na tentativa alternativa:", guardiansError);
          return;
        }
        
        if (!guardiansData || guardiansData.length === 0) {
          setStudents([]);
          return;
        }
        
        // Extrair IDs dos estudantes
        const studentIds = guardiansData.map(g => g.student_id);
        
        // Buscar perfis dos estudantes
        const { data: profilesData, error: profilesError } = await supabase.client
          .from('profiles')
          .select('*')
          .in('user_id', studentIds);
          
        if (profilesError) {
          console.error("Erro ao buscar perfis:", profilesError);
          return;
        }
        
        // Mapear para o formato esperado
        const formattedStudents = guardiansData.map(guardian => {
          const profile = profilesData?.find(p => p.user_id === guardian.student_id);
          return {
            id: guardian.student_id,
            email: profile?.email || "Email não disponível",
            full_name: profile?.full_name || "Nome não disponível",
            is_verified: guardian.is_active,
            added_at: guardian.created_at
          };
        });
        
        setStudents(formattedStudents);
        return;
      }

      // Formatar os dados retornados
      const formattedStudents = (data || []).map((student: any) => ({
        id: student.student_id,
        email: student.student_email || "Email não disponível",
        full_name: student.student_name || "Nome não disponível",
        is_verified: true,
        added_at: new Date().toISOString() // Data aproximada, pois não temos a data exata
      }));

      setStudents(formattedStudents);
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      setError("Ocorreu um erro ao processar os dados dos estudantes");
    } finally {
      setLoading(false);
    }
  };

  // Buscar estudantes ao carregar o componente
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Função para adicionar um novo estudante
  const addStudent = async () => {
    if (!user?.email) {
      setFormError("Usuário não autenticado");
      return;
    }

    // Validar email
    if (!studentEmail || !studentEmail.includes("@")) {
      setFormError("Email do estudante é obrigatório e deve ser válido");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      
      // 1. Verificar se o estudante existe
      const { data: userData, error: userError } = await supabase.client
        .from('users')
        .select('id')
        .eq('email', studentEmail.trim().toLowerCase())
        .single();
        
      if (userError) {
        setFormError(`Estudante com email ${studentEmail} não encontrado`);
        return;
      }
      
      if (!userData?.id) {
        setFormError("Usuário não encontrado");
        return;
      }
      
      // 2. Verificar se a relação já existe
      const { data: existingRelation, error: relationCheckError } = await supabase.client
        .from('guardians')
        .select('id')
        .eq('student_id', String(userData.id))
        .eq('email', user.email);
        
      if (!relationCheckError && existingRelation && existingRelation.length > 0) {
        setFormError("Este estudante já está vinculado à sua conta");
        return;
      }
      
      // 3. Adicionar a relação
      const { data, error } = await supabase.client
        .from('guardians')
        .insert([
          {
            student_id: String(userData.id),
            email: user.email,
            full_name: profile?.full_name || "Responsável",
            is_active: true
          }
        ]);

      if (error) {
        console.error("Erro ao adicionar estudante:", error);
        setFormError(error.message || "Erro ao adicionar estudante");
        return;
      }

      // Fechar o modal e atualizar a lista
      setShowAddStudent(false);
      fetchStudents();
      
      // Limpar o formulário
      setStudentEmail("");
      
      toast({
        title: "Estudante adicionado com sucesso",
        description: "O estudante foi vinculado à sua conta",
      });
    } catch (err: any) {
      console.error("Erro ao adicionar estudante:", err);
      setFormError(err.message || "Erro ao adicionar estudante");
    } finally {
      setSubmitting(false);
    }
  };

  // Função para remover um estudante
  const removeStudent = async () => {
    if (!selectedStudent || !user?.email) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Desativar a relação em vez de excluí-la permanentemente
      const { error } = await supabase.client
        .from('guardians')
        .update({ is_active: false })
        .eq('student_id', String(selectedStudent.id))
        .eq('email', user.email);

      if (error) {
        console.error("Erro ao remover estudante:", error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o estudante",
          variant: "destructive"
        });
        return;
      }

      // Fechar o modal e atualizar a lista
      setShowDeleteConfirm(false);
      fetchStudents();
      
      toast({
        title: "Estudante removido",
        description: "O estudante foi desvinculado da sua conta",
      });
    } catch (err: any) {
      console.error("Erro ao remover estudante:", err);
      toast({
        title: "Erro",
        description: err.message || "Erro ao remover estudante",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setSelectedStudent(null);
    }
  };

  // Função para editar um estudante
  const editStudent = async () => {
    if (!selectedStudent || !user?.email) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      
      // Verificar se o nome não está vazio
      if (!studentName.trim()) {
        setFormError("O nome do estudante é obrigatório");
        return;
      }
      
      // Atualizar o nome do estudante no perfil
      const { error } = await supabase.client
        .from('profiles')
        .update({ full_name: studentName.trim() })
        .eq('user_id', String(selectedStudent.id));

      if (error) {
        console.error("Erro ao editar estudante:", error);
        setFormError(error.message || "Erro ao editar estudante");
        return;
      }

      // Fechar o modal e atualizar a lista
      setShowEditStudent(false);
      fetchStudents();
      
      toast({
        title: "Estudante atualizado",
        description: "As informações do estudante foram atualizadas",
      });
    } catch (err: any) {
      console.error("Erro ao editar estudante:", err);
      setFormError(err.message || "Erro ao editar estudante");
    } finally {
      setSubmitting(false);
    }
  };

  // Abrir modal de edição
  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setStudentName(student.full_name || "");
    setFormError(null);
    setShowEditStudent(true);
  };
  
  // Abrir modal de exclusão
  const openDeleteModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteConfirm(true);
  };
  
  // Verifica se o usuário é responsável/pai
  const isParent = profile?.user_type === "parent" || user?.user_metadata?.user_type === "parent" || user?.user_type === "parent";

  // Adiciona um console.log para depuração
  console.log('[ADD_STUDENT] User type check:', { 
    profileType: profile?.user_type,
    userMetadataType: user?.user_metadata?.user_type,
    userType: user?.user_type,
    isParent
  });

  if (!isParent) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            Esta página é destinada apenas para responsáveis adicionarem estudantes.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/dashboard")}>Voltar para o Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Botão de voltar para o dashboard */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/parent-dashboard")} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Estudantes</h1>
          <p className="text-muted-foreground">
            Gerencie os estudantes que você acompanha
          </p>
        </div>
        <Button onClick={() => setShowAddStudent(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Estudante
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
            <Card key={`skeleton-${i}`} className="overflow-hidden">
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
        ) : students.length === 0 ? (
          <Card className="col-span-full p-6">
            <CardContent className="flex flex-col items-center justify-center pt-6 pb-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum estudante encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione estudantes para acompanhar sua localização
              </p>
              <Button onClick={() => setShowAddStudent(true)}>
                Adicionar Estudante
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Lista de estudantes
          students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle>{student.full_name || "Estudante"}</CardTitle>
                <CardDescription className="flex items-center">
                  {student.email}
                  {student.is_verified ? (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                      Verificado
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
                  <p>Adicionado em: {new Date(student.added_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex w-full gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/student-map/${student.id}`)}
                  >
                    Ver no Mapa
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={() => openEditModal(student)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => openDeleteModal(student)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Modal para adicionar estudante */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Estudante</DialogTitle>
            <DialogDescription>
              Adicione um estudante para acompanhar sua localização.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Estudante *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                O estudante precisa estar cadastrado no sistema.
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
            <Button variant="outline" onClick={() => setShowAddStudent(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addStudent} 
              disabled={submitting || !studentEmail}
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar estudante */}
      <Dialog open={showEditStudent} onOpenChange={setShowEditStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estudante</DialogTitle>
            <DialogDescription>
              Altere as informações do estudante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Estudante *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nome completo"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
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
            <Button variant="outline" onClick={() => setShowEditStudent(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={editStudent} 
              disabled={submitting || !studentName}
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação para excluir estudante */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este estudante da sua lista?
              {selectedStudent && (
                <p className="font-medium mt-2">
                  {selectedStudent.full_name || selectedStudent.email}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={removeStudent} 
              disabled={submitting}
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddStudentPage;

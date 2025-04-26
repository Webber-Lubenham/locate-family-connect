import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, UserCheck, ExternalLink, AlertCircle, Plus, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Tipo para os estudantes vinculados
type RelatedStudent = {
  id: string;
  full_name: string;
  school?: string;
  grade?: string;
  last_location?: {
    place: string;
    time: string;
  };
};

const ParentDashboard = () => {
  const { user, profile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<RelatedStudent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar estudantes relacionados ao pai
  const fetchRelatedStudents = async () => {
    if (!user?.email) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Buscar apenas IDs dos estudantes vinculados ao responsável
      const { data: guardiansData, error: guardiansError } = await supabase.client
        .from('guardians')
        .select('student_id')
        .eq('email', user.email)
        .eq('is_active', true);

      if (guardiansError) {
        console.error("Erro ao buscar relações de responsáveis:", guardiansError);
        setError("Erro ao buscar estudantes vinculados");
        setLoading(false);
        return;
      }

      if (!guardiansData || guardiansData.length === 0) {
        // Nenhum estudante encontrado
        setStudents([]);
        setLoading(false);
        return;
      }

      // Extrair IDs dos estudantes
      const studentIds = guardiansData.map(guardian => guardian.student_id);
      
      // Buscar perfis dos estudantes
      const { data: profilesData, error: profilesError } = await supabase.client
        .from('profiles')
        .select('*')
        .in('user_id', studentIds);
        
      if (profilesError) {
        console.error("Erro ao buscar perfis dos estudantes:", profilesError);
        setError("Erro ao buscar detalhes dos estudantes");
        setLoading(false);
        return;
      }
      
      // Combinar dados
      const studentsData = studentIds.map(studentId => {
        const profile = profilesData?.find(p => p.user_id === studentId);
        return {
          id: studentId,
          full_name: profile?.full_name || "Nome não disponível",
          school: "Escola XYZ", // Dados temporários
          grade: "9º ano", // Dados temporários
          last_location: {
            place: "Localização não disponível",
            time: "Agora"
          }
        };
      });
      
      setStudents(studentsData);
    } catch (error: any) {
      console.error("Erro ao buscar estudantes:", error);
      setError(error.message || "Erro ao buscar estudantes");
    } finally {
      setLoading(false);
    }
  };

  // Buscar estudantes ao carregar o componente
  useEffect(() => {
    fetchRelatedStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Painel do Responsável</h1>
          <p className="text-muted-foreground">
            Acompanhe a localização dos estudantes vinculados à sua conta
          </p>
        </div>
        <Button onClick={() => navigate("/add-student")}>
          <UserPlus className="mr-2 h-4 w-4" /> Gerenciar Estudantes
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : `${students.length} Estudante(s)`}</div>
            <p className="text-xs text-muted-foreground">
              Vinculados ao seu perfil
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <Badge variant="destructive">0</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Notificações</div>
            <p className="text-xs text-muted-foreground">
              Alertas não lidos de localização
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Badge variant="outline">Ativo</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Monitoramento</div>
            <p className="text-xs text-muted-foreground">
              Serviço de localização ativo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Estudantes Vinculados</h2>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p>{error}</p>
              <Button variant="outline" onClick={fetchRelatedStudents}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : students.length === 0 ? (
          <Card className="col-span-full p-6">
            <CardContent className="flex flex-col items-center justify-center pt-6 pb-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum estudante encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione estudantes para acompanhar sua localização
              </p>
              <Button onClick={() => navigate("/add-student")}>
                Adicionar Estudante
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle>{student.full_name}</CardTitle>
                  <CardDescription>{student.grade} - {student.school}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      Última localização: <span className="font-medium">{student.last_location?.place} ({student.last_location?.time})</span>
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/student-map/${student.id}`)}>
                    <MapPin className="mr-2 h-4 w-4" /> Ver no Mapa
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;

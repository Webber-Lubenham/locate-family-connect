import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, UserCheck, ExternalLink, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

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
      
      // Buscar estudantes onde o email do responsável é o mesmo do usuário logado
      const { data, error } = await supabase.client
        .from('guardians')
        .select(`
          student_id,
          users:profiles(
            id,
            full_name,
            user_type
          )
        `)
        .eq('email', user.email)
        .eq('is_active', true);

      if (error) {
        console.error("Erro ao buscar estudantes:", error);
        setError("Não foi possível carregar os estudantes vinculados");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Transformar os dados para o formato esperado
      const formattedStudents: RelatedStudent[] = data.map(item => ({
        id: item.student_id,
        full_name: item.users?.full_name || "Nome não disponível",
        // Dados mockados para escola e série - podem ser expandidos no futuro
        school: "Escola não disponível",
        grade: "Série não disponível",
        // Dados mockados para última localização - serão substituídos pela localização real
        last_location: {
          place: "Localização não disponível",
          time: "Agora"
        }
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
    fetchRelatedStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Olá, {profile?.full_name || 'Responsável'}!</h1>
        <p className="text-muted-foreground">
          Monitore e acompanhe seus estudantes no EduConnect.
        </p>
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
          <Card className="p-6 text-center">
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Você não tem estudantes vinculados</p>
              <p className="text-sm text-muted-foreground mb-4">
                Aguarde até que um estudante adicione você como responsável.
              </p>
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

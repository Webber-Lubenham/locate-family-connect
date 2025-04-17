
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, UserCheck } from "lucide-react";

const Dashboard = () => {
  const { profile } = useUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Bem-vindo, {profile?.name || 'Usuário'}!</h1>
        <p className="text-muted-foreground">
          Acesse as informações e recursos do EduConnect.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profile?.role === 'student' ? (
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
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 Responsáveis</div>
                <p className="text-xs text-muted-foreground">
                  Pessoas vinculadas ao seu perfil
                </p>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                <Badge variant="destructive">2</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Notificações</div>
                <p className="text-xs text-muted-foreground">
                  Você tem alertas não lidos de localização
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Conta</CardTitle>
            <Badge variant="outline">Ativo</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.role === 'student' ? 'Estudante' : 'Responsável'}</div>
            <p className="text-xs text-muted-foreground">
              Tipo de conta: {profile?.role === 'student' ? 'Estudante' : 'Responsável'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

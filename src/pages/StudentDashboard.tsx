
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, BookOpen, Bell } from "lucide-react";

const StudentDashboard = () => {
  const { profile } = useUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Olá, {profile?.name || 'Estudante'}!</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle do EduConnect.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minha Localização</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Localização Ativa</div>
            <p className="text-xs text-muted-foreground">
              Sua localização está sendo compartilhada
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Responsáveis</div>
            <p className="text-xs text-muted-foreground">
              Visualizando sua localização
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Mensagens</div>
            <p className="text-xs text-muted-foreground">
              Dos seus responsáveis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Meu Mapa</CardTitle>
              <CardDescription>Visualize sua localização atual e trajetos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-slate-100 rounded-md flex items-center justify-center">
                <MapPin className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mensagens</CardTitle>
              <CardDescription>Comunicação com responsáveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-slate-100 rounded-md flex items-center justify-center">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

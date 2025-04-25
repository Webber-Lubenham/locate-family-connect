
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, UserCheck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ParentDashboard = () => {
  const { profile } = useUser();
  const navigate = useNavigate();

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
            <div className="text-2xl font-bold">2 Estudantes</div>
            <p className="text-xs text-muted-foreground">
              Vinculados ao seu perfil
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Maria Silva</CardTitle>
              <CardDescription>9º ano - Escola Estadual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-sm">Última localização: <span className="font-medium">Escola (há 10 min)</span></span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/student-map/1")}>
                <MapPin className="mr-2 h-4 w-4" /> Ver no Mapa
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>João Silva</CardTitle>
              <CardDescription>6º ano - Escola Municipal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Última localização: <span className="font-medium">Casa da avó (há 30 min)</span></span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/student-map/2")}>
                <MapPin className="mr-2 h-4 w-4" /> Ver no Mapa
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;

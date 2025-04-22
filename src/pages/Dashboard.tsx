
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import GuardianList from "@/components/GuardianList";

const Dashboard = () => {
  const { profile, user, signOut } = useUser();
  const userType = profile?.user_type || user?.user_type || 'student';
  const isStudent = userType === 'student';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo, {profile?.full_name || user?.full_name || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            Acesse as informações e recursos do EduConnect
          </p>
        </div>
        <Button variant="destructive" onClick={signOut}>Sair</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {isStudent && (
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
              <CardHeader>
                <CardTitle>Meus Responsáveis</CardTitle>
                <CardDescription>
                  Gerencie os responsáveis que podem receber sua localização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuardianList />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

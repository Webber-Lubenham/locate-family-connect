
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GuardianList from "@/components/GuardianList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GuardiansPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meus Responsáveis</h1>
          <p className="text-muted-foreground">
            Gerencie os responsáveis que podem receber sua localização
          </p>
        </div>
        <div>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Responsáveis</CardTitle>
          <CardDescription>
            Adicione, remova ou envie localização para seus responsáveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuardianList />
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardiansPage;

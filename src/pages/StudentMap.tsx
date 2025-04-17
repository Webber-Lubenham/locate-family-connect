
import React from "react";
import { Card } from "@/components/ui/card";

const StudentMap = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mapa de Localização</h1>
        <p className="text-muted-foreground">
          Visualize sua localização atual e histórico de trajetos
        </p>
      </div>

      <Card className="p-4">
        <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center">
          <p className="text-slate-500">O componente de mapa será integrado aqui</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Histórico de Localizações</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Escola</p>
                <p className="text-sm text-muted-foreground">Hoje, 13:45</p>
              </div>
              <Badge>Atual</Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Casa</p>
                <p className="text-sm text-muted-foreground">Hoje, 08:15</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Biblioteca</p>
                <p className="text-sm text-muted-foreground">Ontem, 16:30</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Zonas Seguras</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Casa</p>
                <p className="text-sm text-muted-foreground">Raio: 100m</p>
              </div>
              <Badge variant="outline">Ativo</Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Escola</p>
                <p className="text-sm text-muted-foreground">Raio: 200m</p>
              </div>
              <Badge variant="outline">Ativo</Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Casa da Avó</p>
                <p className="text-sm text-muted-foreground">Raio: 100m</p>
              </div>
              <Badge variant="outline">Ativo</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentMap;


import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EmptyStateProps {
  onAddClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddClick }) => {
  return (
    <Card className="col-span-full p-6">
      <CardContent className="flex flex-col items-center justify-center pt-6 pb-6 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-3">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Nenhum responsável cadastrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione seus responsáveis para que eles possam acompanhar sua localização
        </p>
        <Button onClick={onAddClick}>
          Adicionar Responsável
        </Button>
      </CardContent>
    </Card>
  );
};

export const LoadingState: React.FC = () => {
  return (
    <>
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex justify-between mt-6">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};

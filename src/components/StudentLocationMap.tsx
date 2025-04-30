
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useMapInitialization } from '@/hooks/useMapInitialization';

interface StudentLocationMapProps {
  onShareAll: () => void;
  isSendingAll: boolean;
  guardianCount: number;
}

const StudentLocationMap: React.FC<StudentLocationMapProps> = ({ 
  onShareAll, 
  isSendingAll, 
  guardianCount 
}) => {
  const { mapContainer, mapError, handleUpdateLocation } = useMapInitialization();
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Localização</CardTitle>
        <CardDescription>
          Visualize sua localização no mapa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="relative h-[400px] rounded-2xl shadow-2xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-gray-100 overflow-hidden group transition-all duration-300"
          ref={mapContainer}
        >
          {/* Título flutuante */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-1 rounded-full shadow text-blue-700 font-semibold text-sm pointer-events-none select-none">
            Sua Localização
          </div>
          {/* Botão de atualizar localização estilizado reposicionado */}
          <Button
            size="sm"
            className="absolute bottom-4 right-4 z-20 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-1 transition-all duration-200"
            variant="default"
            onClick={handleUpdateLocation}
          >
            Atualizar Localização
          </Button>
          {/* Overlay de erro */}
          {mapError && (
            <div className="flex items-center justify-center h-full text-red-500 bg-white/80 absolute inset-0 z-30">
              {mapError}
            </div>
          )}
          {/* Efeito de hover no mapa */}
          <div className="absolute inset-0 pointer-events-none group-hover:ring-4 group-hover:ring-blue-200 transition-all duration-300 rounded-2xl" />
        </div>
        <Button 
          variant="secondary" 
          className="mt-4 w-full" 
          onClick={onShareAll} 
          disabled={isSendingAll || guardianCount === 0}
        >
          {isSendingAll ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          Enviar Localização para Todos
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudentLocationMap;

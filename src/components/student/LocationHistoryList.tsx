import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LocationData } from '@/types/database';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import LocationRequestButton from './LocationRequestButton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { MapPin, Clock, AlertCircle } from 'lucide-react';

interface LocationHistoryListProps {
  locationData: LocationData[];
  loading: boolean;
  error: string | null;
  userType?: string;
  studentDetails?: { name: string; email: string } | null;
  senderName?: string;
}

const LocationHistoryList: React.FC<LocationHistoryListProps> = ({ 
  locationData, 
  loading, 
  error, 
  userType, 
  studentDetails,
  senderName
}) => {
  const { toast } = useToast();

  const shareLocationViaEmail = async (locationId: string) => {
    toast({
      title: "Enviando email...",
      description: "Estamos enviando sua localização por email para seus responsáveis",
    });

    try {
      const { error } = await supabase.functions.invoke('share-location', {
        body: { locationId }
      });

      if (error) {
        console.error('Error sharing location:', error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar o email com sua localização",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Email com sua localização enviado para seus responsáveis",
      });
    } catch (err) {
      console.error('Error invoking function:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar enviar o email",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (locationData.length === 0) {
    return (
      <div>
        <p className="text-center text-gray-500 py-4">
          Nenhum histórico de localização encontrado
        </p>
        {userType === 'parent' && studentDetails && (
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600 mb-3">
              Solicite que {studentDetails.name} compartilhe sua localização atual.
            </p>
            {studentDetails.email && (
              <LocationRequestButton 
                studentEmail={studentDetails.email} 
                studentName={studentDetails.name} 
                senderName={senderName || 'Responsável'} 
              />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locationData.map((location) => (
        <div
          key={location.id}
          className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <div className="font-medium">
              {location.student_name || 'Usuário Desconhecido'}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(location.timestamp).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Lat: {location.latitude.toFixed(6)}, Long:{' '}
              {location.longitude.toFixed(6)}
            </div>
          </div>
          {userType === 'student' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareLocationViaEmail(location.id)}
            >
              Enviar por Email
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default LocationHistoryList;

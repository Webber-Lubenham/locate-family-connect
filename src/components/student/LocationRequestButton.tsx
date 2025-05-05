
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, SendIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiService } from '@/lib/api/api-service';

interface LocationRequestButtonProps {
  studentEmail: string;
  studentName: string;
  senderName: string;
}

const LocationRequestButton: React.FC<LocationRequestButtonProps> = ({ 
  studentEmail, 
  studentName, 
  senderName 
}) => {
  const [sendingRequest, setSendingRequest] = useState(false);
  const { toast } = useToast();

  const requestLocationUpdate = async () => {
    if (!studentEmail) {
      toast({
        title: "Erro",
        description: "Email do estudante não disponível",
        variant: "destructive"
      });
      return;
    }

    setSendingRequest(true);
    
    try {
      toast({
        title: "Enviando solicitação...",
        description: "Estamos solicitando a atualização de localização",
      });

      // Use email service to send request
      // Atualizando para compatibilidade com a nova assinatura (4 parâmetros em vez de 5)
      const result = await apiService.shareLocation(
        studentEmail,
        0, // placeholder latitude
        0, // placeholder longitude
        senderName || 'Responsável'
        // Parâmetro isRequest removido para compatibilidade
      );
      
      // Verificar o resultado
      const success = result && typeof result === 'object' ? result.success : !!result;

      if (success) {
        toast({
          title: "Solicitação enviada",
          description: `Solicitação de localização enviada para ${studentName}`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível enviar a solicitação",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('[DEBUG] Error requesting location:', err);
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao solicitar a localização",
        variant: "destructive"
      });
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <Button 
      onClick={requestLocationUpdate}
      disabled={sendingRequest}
      className="w-full"
    >
      {sendingRequest ? (
        <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
      ) : (
        <><SendIcon className="mr-2 h-4 w-4" /> Solicitar Localização</>
      )}
    </Button>
  );
};

export default LocationRequestButton;

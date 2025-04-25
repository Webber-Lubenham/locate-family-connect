
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';
import axios from 'axios';

export const EmailTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const runEmailTest = async () => {
    setIsLoading(true);
    
    try {
      // Execute the test email script using axios to run the Node.js script
      const response = await axios.post('/run-email-test', {}, {
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data.success) {
        toast({
          title: 'Teste de Email Enviado',
          description: 'O email de teste foi enviado com sucesso. Verifique a caixa de entrada.',
          variant: 'default'
        });
      } else {
        throw new Error('Falha no envio do email');
      }
    } catch (error) {
      console.error('Erro no teste de email:', error);
      toast({
        title: 'Erro no Teste de Email',
        description: 'Não foi possível enviar o email de teste. Verifique os logs.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={runEmailTest} 
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Send size={16} />
      {isLoading ? 'Enviando...' : 'Testar Envio de Email'}
    </Button>
  );
};

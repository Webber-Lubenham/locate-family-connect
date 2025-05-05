
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const EmailTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const runEmailTest = async () => {
    setIsLoading(true);
    
    try {
      // Chamar diretamente a edge function de teste de email
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: {}
      });

      if (error) {
        throw new Error(`Erro na função: ${error.message}`);
      }

      if (data && data.success) {
        toast({
          title: 'Email de Teste Enviado',
          description: 'O email de teste foi enviado para frankwebber33@hotmail.com. Verifique a caixa de entrada.',
          variant: 'default'
        });
      } else {
        throw new Error('Falha no envio do email');
      }
    } catch (error) {
      console.error('Erro no teste de email:', error);
      toast({
        title: 'Erro no Teste de Email',
        description: `Não foi possível enviar o email de teste: ${error.message}`,
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
      {isLoading ? 'Enviando...' : 'Testar Envio para frankwebber33@hotmail.com'}
    </Button>
  );
};

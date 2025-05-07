
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created_at: string;
  processed: boolean;
  processed_at: string | null;
  signature?: string;
}

const WebhookAdmin: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar webhooks',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const processWebhook = async (id: string) => {
    try {
      const { error } = await supabase.rpc('process_webhook_event', { event_id: id });
      
      if (error) throw error;
      
      toast({
        title: 'Webhook processado',
        description: 'O webhook foi processado com sucesso.',
      });
      
      fetchWebhooks();
    } catch (error: any) {
      toast({
        title: 'Erro ao processar webhook',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Administração de Webhooks</h1>
      
      <Button onClick={fetchWebhooks} disabled={loading} className="mb-4">
        {loading ? 'Carregando...' : 'Atualizar'}
      </Button>
      
      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {webhook.type || 'Webhook sem tipo'}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${webhook.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {webhook.processed ? 'Processado' : 'Pendente'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">
                ID: {webhook.id}<br />
                Data: {new Date(webhook.created_at).toLocaleString()}<br />
                {webhook.processed_at && `Processado em: ${new Date(webhook.processed_at).toLocaleString()}`}
                {webhook.data && typeof webhook.data === 'object' && webhook.data.signature && 
                  `Assinatura: ${webhook.data.signature}`}
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                <pre className="text-xs">
                  {JSON.stringify(webhook.data, null, 2)}
                </pre>
              </div>
              
              {!webhook.processed && (
                <Button 
                  onClick={() => processWebhook(webhook.id)} 
                  className="mt-4"
                  size="sm"
                >
                  Processar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        
        {webhooks.length === 0 && !loading && (
          <Card>
            <CardContent className="py-6 text-center">
              <p>Nenhum webhook encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WebhookAdmin;

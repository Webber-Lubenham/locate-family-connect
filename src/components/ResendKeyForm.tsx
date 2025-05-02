
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { verifyResendApiKey } from '@/lib/email-utils';
import { env } from '@/env';
import { AlertCircle, Check, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResendKeyForm: React.FC = () => {
  const [apiKey, setApiKey] = useState(env.RESEND_API_KEY || localStorage.getItem('RESEND_API_KEY') || '');
  const [loading, setLoading] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey) {
      validateApiKey();
    }
  }, []);

  const validateApiKey = async () => {
    if (!apiKey) {
      setKeyValid(null);
      setValidationMessage('');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyResendApiKey();
      setKeyValid(result.valid);
      setValidationMessage(result.message);
      
      if (result.valid) {
        toast({
          title: "Chave API válida",
          description: "A chave API do Resend é válida e está pronta para uso."
        });
      } else {
        toast({
          title: "Chave API inválida",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setKeyValid(false);
      setValidationMessage(error.message || 'Erro ao validar a chave API');
      toast({
        title: "Erro de validação",
        description: "Não foi possível validar a chave API do Resend.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = () => {
    if (!apiKey) {
      toast({
        title: "Campo vazio",
        description: "Por favor, insira sua chave API do Resend.",
        variant: "destructive"
      });
      return;
    }

    // Salvar no localStorage
    localStorage.setItem('RESEND_API_KEY', apiKey);
    toast({
      title: "Chave API salva",
      description: "A chave API do Resend foi salva para esta sessão."
    });
    
    // Validar a chave
    validateApiKey();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">Configurar API Key do Resend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-700" />
          <AlertDescription className="text-blue-700">
            <p>O Resend é usado para enviar emails de recuperação de senha e outras notificações importantes.</p>
            <p className="text-xs mt-1">
              Você pode obter uma chave API gratuita em{" "}
              <a 
                href="https://resend.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline"
              >
                resend.com/api-keys
              </a>
            </p>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="resend-api-key" className="text-sm font-medium">
              Resend API Key
            </label>
            <Input 
              id="resend-api-key" 
              type="password"
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="re_123..." 
              className="font-mono text-sm"
            />
          </div>
          
          {keyValid !== null && (
            <Alert variant={keyValid ? "default" : "destructive"} className={keyValid ? "bg-green-50 border-green-200" : ""}>
              {keyValid ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={keyValid ? "text-green-700" : ""}>
                {validationMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button 
          onClick={validateApiKey} 
          variant="outline" 
          disabled={!apiKey || loading}
        >
          {loading ? "Validando..." : "Testar Chave"}
        </Button>
        <Button 
          onClick={saveApiKey} 
          disabled={!apiKey || loading}
        >
          Salvar Chave API
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResendKeyForm;

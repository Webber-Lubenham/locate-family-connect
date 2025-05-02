
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, AlertCircle, Send, RefreshCw } from 'lucide-react';
import { verifyResendApiKey, sendTestEmail } from '@/lib/email-utils';

export const EmailConfigTester = () => {
  const [verifying, setVerifying] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [apiStatus, setApiStatus] = useState<{valid?: boolean; message?: string}>({});
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string}>({});
  
  const handleVerifyApiKey = async () => {
    setVerifying(true);
    try {
      const result = await verifyResendApiKey();
      setApiStatus(result);
    } catch (error) {
      setApiStatus({ valid: false, message: 'Erro ao verificar chave da API' });
    } finally {
      setVerifying(false);
    }
  };
  
  const handleSendTestEmail = async () => {
    if (!testEmail) return;
    
    setSendingTest(true);
    setTestResult({});
    
    try {
      const result = await sendTestEmail(testEmail);
      setTestResult({ 
        success: result.success, 
        message: result.success 
          ? `Email enviado com sucesso para ${testEmail}` 
          : `Falha ao enviar email: ${result.error}` 
      });
    } catch (error: any) {
      setTestResult({ 
        success: false, 
        message: `Erro ao enviar email: ${error.message}` 
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verificador de Configuração de Email</CardTitle>
        <CardDescription>
          Verifique e teste a configuração de envio de emails do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button 
            onClick={handleVerifyApiKey}
            disabled={verifying}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {verifying ? 'Verificando...' : 'Verificar Chave API do Resend'}
          </Button>
          
          {apiStatus.valid !== undefined && (
            <Alert 
              variant={apiStatus.valid ? "default" : "destructive"}
              className="mt-3"
            >
              {apiStatus.valid ? 
                <Check className="h-4 w-4" /> : 
                <AlertCircle className="h-4 w-4" />
              }
              <AlertTitle>{apiStatus.valid ? "Sucesso" : "Erro"}</AlertTitle>
              <AlertDescription>{apiStatus.message}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="testEmail">Enviar email de teste</Label>
          <div className="flex gap-2">
            <Input
              id="testEmail"
              type="email"
              placeholder="exemplo@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <Button 
              onClick={handleSendTestEmail}
              disabled={!testEmail || sendingTest}
              className="flex-shrink-0 flex items-center gap-1"
            >
              {sendingTest ? 
                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                <Send className="h-4 w-4" />
              }
              {sendingTest ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
          
          {testResult.success !== undefined && (
            <Alert 
              variant={testResult.success ? "default" : "destructive"}
              className="mt-3"
            >
              {testResult.success ? 
                <Check className="h-4 w-4" /> : 
                <AlertCircle className="h-4 w-4" />
              }
              <AlertTitle>{testResult.success ? "Sucesso" : "Erro"}</AlertTitle>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          Verifique a caixa de spam se não receber o email de teste
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmailConfigTester;


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { verifyResendApiKey, sendTestEmail } from '@/lib/email-utils';
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordResetTesterProps {
  email?: string;
}

const PasswordResetTester: React.FC<PasswordResetTesterProps> = ({ email = "mauro.lima@educacao.am.gov.br" }) => {
  const [loading, setLoading] = useState(false);
  const [apiValid, setApiValid] = useState<boolean | null>(null);
  const [apiMessage, setApiMessage] = useState<string>("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  // Verifica se a API key está válida
  const checkApiKey = async () => {
    setLoading(true);
    try {
      const result = await verifyResendApiKey();
      setApiValid(result.valid);
      setApiMessage(result.message);
      
      if (!result.valid) {
        toast({
          title: "Problema com a API Key",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao verificar API key:", error);
      setApiValid(false);
      setApiMessage("Erro ao verificar a chave de API");
      
      toast({
        title: "Erro",
        description: "Não foi possível verificar a chave de API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Envia um email de teste usando o Resend diretamente
  const handleTestEmail = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await sendTestEmail(email);
      
      if (result.success) {
        setTestResult({
          success: true,
          message: `Email de teste enviado para ${email}. ID: ${result.data?.id || 'N/A'}`
        });
        
        toast({
          title: "Email enviado",
          description: `Email de teste enviado para ${email}`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Erro ao enviar email: ${result.error}`
        });
        
        toast({
          title: "Falha no envio",
          description: result.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao enviar email de teste:", error);
      setTestResult({
        success: false,
        message: `Exceção: ${error.message || "Erro desconhecido"}`
      });
      
      toast({
        title: "Erro",
        description: "Falha na comunicação com o serviço de email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Testa o fluxo real de recuperação de senha via Supabase
  const handleResetPassword = async () => {
    setLoading(true);
    setResetResult(null);
    
    try {
      console.log(`Iniciando processo de recuperação de senha para: ${email}`);
      
      const { error } = await supabase.client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        setResetResult({
          success: false,
          message: `Erro: ${error.message || "Falha na solicitação"}`
        });
        
        toast({
          title: "Erro na recuperação",
          description: error.message || "Não foi possível enviar o link de recuperação",
          variant: "destructive"
        });
      } else {
        console.log("Solicitação de recuperação de senha bem-sucedida");
        setResetResult({
          success: true,
          message: `Link de recuperação enviado para ${email}`
        });
        
        toast({
          title: "Link enviado",
          description: `Verifique a caixa de entrada de ${email} (e a pasta de spam)`,
        });
      }
    } catch (error: any) {
      console.error("Erro na solicitação de recuperação:", error);
      setResetResult({
        success: false,
        message: `Exceção: ${error.message || "Erro desconhecido"}`
      });
      
      toast({
        title: "Erro",
        description: "Falha no processo de recuperação de senha",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Executa a verificação da API key ao carregar o componente
  React.useEffect(() => {
    checkApiKey();
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Recuperação de Senha</CardTitle>
        <CardDescription>
          Testando o envio de email de recuperação para: <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status da API Key */}
        <div>
          <h3 className="text-lg font-medium mb-2">Status da API do Resend</h3>
          {apiValid === null ? (
            <div className="flex items-center text-gray-500">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Verificando configuração...
            </div>
          ) : apiValid ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{apiMessage}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Resultado do envio de email de teste */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"} className={testResult.success ? "bg-blue-50 border-blue-200" : ""}>
            {testResult.success ? (
              <MailCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className={testResult.success ? "text-blue-700" : ""}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Resultado da recuperação de senha */}
        {resetResult && (
          <Alert variant={resetResult.success ? "default" : "destructive"} className={resetResult.success ? "bg-blue-50 border-blue-200" : ""}>
            {resetResult.success ? (
              <MailCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className={resetResult.success ? "text-blue-700" : ""}>
              {resetResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-sm">
          <h4 className="font-medium text-amber-800 mb-2">Dicas para solução de problemas</h4>
          <ul className="list-disc pl-5 space-y-1 text-amber-700">
            <li>Se o email não chegar, verifique a pasta de spam/lixo eletrônico</li>
            <li>Confirme se o email está cadastrado no sistema</li>
            <li>Verifique se o domínio está configurado corretamente no Resend</li>
            <li>Tente usar um email alternativo para teste</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={checkApiKey} 
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Verificar configuração
        </Button>
        
        <Button 
          variant="secondary" 
          className="w-full sm:w-auto"
          onClick={handleTestEmail} 
          disabled={loading || apiValid === false}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Enviar email de teste
        </Button>
        
        <Button 
          variant="default" 
          className="w-full sm:w-auto"
          onClick={handleResetPassword} 
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Testar recuperação de senha
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PasswordResetTester;

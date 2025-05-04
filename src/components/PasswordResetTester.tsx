
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { verifyResendApiKey, sendTestEmail } from '@/lib/email-utils';
import { AlertCircle, CheckCircle2, Loader2, MailCheck, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordResetTesterProps {
  email?: string;
}

const PasswordResetTester: React.FC<PasswordResetTesterProps> = ({ email = "mauro.lima@educacao.am.gov.br" }) => {
  const [loading, setLoading] = useState(false);
  const [apiValid, setApiValid] = useState<boolean | null>(null);
  const [apiMessage, setApiMessage] = useState<string>("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkApiKey();
    checkSupabaseConfig();
  }, []);

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

  // Verificar configuração do Supabase
  const checkSupabaseConfig = async () => {
    try {
      // Obter informações sobre a configuração atual do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      setSupabaseConfig({
        authenticated: !!session,
        url: 'configured',
        anon_key_valid: !!supabase.auth
      });
    } catch (error) {
      console.error("Erro ao verificar config do Supabase:", error);
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
          message: `Email de teste enviado para ${email}. ID: ${result.data?.id || 'N/A'}`,
          details: result.data
        });
        
        toast({
          title: "Email enviado",
          description: `Email de teste enviado para ${email}`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Erro ao enviar email: ${result.error}`,
          details: result.error
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
        message: `Exceção: ${error.message || "Erro desconhecido"}`,
        details: error
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
      
      // Vamos capturar todo o objeto de resultado para diagnóstico
      const fullResponse = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      console.log("Resposta completa do resetPasswordForEmail:", fullResponse);
      
      if (fullResponse.error) {
        console.error("Erro ao solicitar recuperação de senha:", fullResponse.error);
        setResetResult({
          success: false,
          message: `Erro: ${fullResponse.error.message || "Falha na solicitação"}`,
          details: fullResponse.error
        });
        
        toast({
          title: "Erro na recuperação",
          description: fullResponse.error.message || "Não foi possível enviar o link de recuperação",
          variant: "destructive"
        });
      } else {
        console.log("Solicitação de recuperação de senha bem-sucedida", fullResponse);
        setResetResult({
          success: true,
          message: `Link de recuperação enviado para ${email}`,
          details: fullResponse.data
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
        message: `Exceção: ${error.message || "Erro desconhecido"}`,
        details: error
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

        {/* Configuração Supabase */}
        {supabaseConfig && (
          <div>
            <h3 className="text-lg font-medium mb-2">Configuração do Supabase</h3>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <p className="text-blue-700 mb-1">
                <span className="font-medium">URL:</span> {supabaseConfig.url}
              </p>
              <p className="text-blue-700 mb-1">
                <span className="font-medium">Status auth:</span> {supabaseConfig.authenticated ? 'Autenticado' : 'Não autenticado'}
              </p>
              <p className="text-blue-700">
                <span className="font-medium">Chave anônima:</span> {supabaseConfig.anon_key_valid ? 'Válida' : 'Inválida'}
              </p>
            </div>
          </div>
        )}

        {/* Resultado do envio de email de teste */}
        {testResult && (
          <div>
            <h3 className="text-lg font-medium mb-2">Resultado do Teste Direto</h3>
            <Alert variant={testResult.success ? "default" : "destructive"} className={testResult.success ? "bg-blue-50 border-blue-200" : ""}>
              {testResult.success ? (
                <MailCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={testResult.success ? "text-blue-700" : ""}>
                {testResult.message}
                
                {testResult.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium">Ver detalhes técnicos</summary>
                    <pre className="mt-2 p-2 bg-gray-100 text-xs rounded overflow-auto max-h-24 whitespace-pre-wrap">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Resultado da recuperação de senha */}
        {resetResult && (
          <div>
            <h3 className="text-lg font-medium mb-2">Resultado Recuperação de Senha</h3>
            <Alert variant={resetResult.success ? "default" : "destructive"} className={resetResult.success ? "bg-blue-50 border-blue-200" : ""}>
              {resetResult.success ? (
                <MailCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={resetResult.success ? "text-blue-700" : ""}>
                {resetResult.message}
                
                {resetResult.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium">Ver detalhes técnicos</summary>
                    <pre className="mt-2 p-2 bg-gray-100 text-xs rounded overflow-auto max-h-24 whitespace-pre-wrap">
                      {JSON.stringify(resetResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-700" />
          <AlertDescription className="text-amber-700">
            <h4 className="font-medium text-amber-800 mb-2">Lembrete sobre a configuração do Supabase SMTP</h4>
            <p className="mb-2">Certifique-se de que o Supabase está configurado para usar o SMTP do Resend:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>SMTP Host: <code>smtp.resend.com</code></li>
              <li>SMTP Port: <code>587</code> (TLS) ou <code>465</code> (SSL)</li>
              <li>SMTP User: <code>resend</code></li>
              <li>SMTP Password: sua <code>RESEND_API_KEY</code></li>
              <li>Sender Email: <code>onboarding@resend.dev</code> (temporário)</li>
            </ul>
            <p className="mt-2 text-xs">Para verificar ou alterar essas configurações, acesse o painel do Supabase em &quot;Auth {'->'} Settings {'->'} Email&quot;.</p>
          </AlertDescription>
        </Alert>
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

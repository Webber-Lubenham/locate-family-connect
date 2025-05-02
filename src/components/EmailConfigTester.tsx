
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Check, Loader2, Send, X, ExternalLink } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { verifyResendApiKey, sendTestEmail } from '@/lib/email-utils';

type ApiKeyStatus = 'unknown' | 'valid' | 'invalid' | 'checking';
type EmailStatus = 'idle' | 'sending' | 'sent' | 'error';

const EmailConfigTester: React.FC = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('unknown');
  const [testEmail, setTestEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const { toast } = useToast();

  // Check Resend API key status
  const checkApiKey = async () => {
    setApiKeyStatus('checking');
    
    try {
      const result = await verifyResendApiKey();
      setApiKeyStatus(result.valid ? 'valid' : 'invalid');
      setStatusMessage(result.message);
    } catch (error: any) {
      setApiKeyStatus('invalid');
      setStatusMessage(`Erro ao verificar chave: ${error.message}`);
    }
  };

  // Open Resend dashboard in new tab
  const openResendDashboard = () => {
    window.open('https://resend.com/dashboard', '_blank');
  };

  // Open Supabase SMTP settings in new tab
  const openSupabaseSettings = () => {
    window.open('https://supabase.com/dashboard/project/rsvjnndhbyyxktbczlnk/auth/providers', '_blank');
  };

  // Send a test email
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Por favor, informe um email para envio do teste"
      });
      return;
    }
    
    setEmailStatus('sending');
    
    try {
      const result = await sendTestEmail(testEmail);
      
      if (result.success) {
        setEmailStatus('sent');
        setErrorDetails(null);
        toast({
          title: "Email enviado com sucesso",
          description: "Verifique sua caixa de entrada (e a pasta de spam)"
        });
      } else {
        setEmailStatus('error');
        setStatusMessage(result.error || 'Erro ao enviar o email');
        setErrorDetails(result.error);
        toast({
          variant: "destructive",
          title: "Erro ao enviar email",
          description: result.error || "Não foi possível enviar o email de teste"
        });
      }
    } catch (error: any) {
      setEmailStatus('error');
      setStatusMessage(error.message);
      setErrorDetails(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao enviar o email de teste"
      });
    }
  };

  // Load on mount
  React.useEffect(() => {
    checkApiKey();
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Diagnóstico de Email</CardTitle>
        <CardDescription>
          Verifique a configuração do serviço de email e envie emails de teste
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resend API Key Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Status da API Key do Resend</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkApiKey}
                disabled={apiKeyStatus === 'checking'}
              >
                {apiKeyStatus === 'checking' ? 
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                  'Verificar Novamente'
                }
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openResendDashboard}
                title="Abrir Dashboard do Resend"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            {apiKeyStatus === 'checking' && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando a chave de API...</span>
              </div>
            )}
            
            {apiKeyStatus === 'valid' && (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-5 w-5" />
                <span>Chave de API válida e funcionando</span>
              </div>
            )}
            
            {apiKeyStatus === 'invalid' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-red-600">
                  <X className="h-5 w-5" />
                  <span>Chave de API inválida ou com problemas</span>
                </div>
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Problema de Configuração</AlertTitle>
                  <AlertDescription>
                    {statusMessage}
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium">Soluções possíveis:</p>
                      <ul className="text-xs list-disc pl-5">
                        <li>Verifique a chave API_KEY no arquivo .env e certifique-se de que ela está correta</li>
                        <li>Acesse o dashboard do Resend para gerar uma nova chave</li>
                        <li>Verifique se a chave não expirou ou foi revogada</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {apiKeyStatus === 'unknown' && (
              <div className="flex items-center space-x-2 text-gray-500">
                <AlertTriangle className="h-4 w-4" />
                <span>Status da chave desconhecido</span>
              </div>
            )}
          </div>
        </div>
        
        {/* SMTP Configuration Check */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Configuração SMTP do Supabase</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={openSupabaseSettings}
              title="Abrir Configurações do Supabase"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-700" />
            <AlertDescription className="text-blue-700">
              <p className="mb-2">O Supabase precisa estar configurado com o SMTP do Resend:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <p><strong>SMTP Host:</strong> smtp.resend.com</p>
                  <p><strong>SMTP Port:</strong> 587 (TLS) ou 465 (SSL)</p>
                </div>
                <div>
                  <p><strong>SMTP User:</strong> resend</p>
                  <p><strong>SMTP Password:</strong> sua RESEND_API_KEY</p>
                  <p><strong>Sender Email:</strong> onboarding@resend.dev</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        
        {/* Test Email Form */}
        <form onSubmit={handleSendTest} className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Email para teste</Label>
            <div className="flex space-x-2">
              <Input
                id="testEmail"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={emailStatus === 'sending' || !testEmail}
              >
                {emailStatus === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Email status messages */}
          {emailStatus === 'sent' && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Email enviado com sucesso</AlertTitle>
              <AlertDescription>
                Por favor, verifique sua caixa de entrada (e também a pasta de spam).
              </AlertDescription>
            </Alert>
          )}
          
          {emailStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao enviar email</AlertTitle>
              <AlertDescription>
                {statusMessage}
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs underline"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                >
                  {showTechnicalDetails ? 'Ocultar detalhes' : 'Ver detalhes técnicos'}
                </Button>
                
                {showTechnicalDetails && errorDetails && (
                  <div className="mt-2 text-xs bg-red-950 text-white p-2 rounded overflow-auto max-h-24">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(errorDetails, null, 2)}</pre>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start">
        <div className="text-xs text-muted-foreground space-y-3 w-full">
          <div>
            <p className="font-medium mb-1">Dicas para resolução de problemas:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verifique se o domínio está corretamente verificado no Resend</li>
              <li>Confira se a chave API do Resend está correta e ativa</li>
              <li>Para recuperação de senha, verifique as configurações SMTP no Supabase</li>
            </ul>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t w-full">
            <p className="text-sm">Precisa de mais ajuda?</p>
            <Button 
              variant="link" 
              size="sm"
              onClick={() => window.open('/email-diagnostic', '_self')}
              className="text-xs p-0 h-auto"
            >
              Ir para diagnóstico completo
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EmailConfigTester;

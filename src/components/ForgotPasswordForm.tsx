
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { UserType } from '@/lib/auth-redirects';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, InfoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { env } from "@/env";
import { verifyResendApiKey, sendPasswordResetEmail } from '@/lib/email-utils';

export interface ForgotPasswordFormProps {
  userType: UserType;
  onBackToLogin: () => void;
  variant?: 'login' | 'register';
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  userType,
  onBackToLogin,
  variant,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<any>(null);
  const [detailedLogging, setDetailedLogging] = useState(false);
  const [useResend, setUseResend] = useState(!!env.RESEND_API_KEY);
  const [resendApiKey, setResendApiKey] = useState(env.RESEND_API_KEY || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!env.RESEND_API_KEY);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApiError(null);
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      console.log(`Iniciando processo de recuperação de senha para: ${email}`);
      
      // Ativar logs detalhados para diagnóstico
      if (detailedLogging) {
        console.log("Configuração do Supabase:", {
          hasAuth: !!supabase.auth
        });
      }

      let response;
      
      // Se usar Resend está habilitado e temos uma API key
      if (useResend && resendApiKey) {
        // Primeiro verificar se a chave API é válida
        const apiCheck = await verifyResendApiKey();
        
        if (!apiCheck.valid) {
          throw new Error(apiCheck.message);
        }
        
        // Criar URL para reset de senha - Importante: usar URL completa
        const resetUrl = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`;
        
        console.log('URL de recuperação de senha:', resetUrl);
        
        // Enviar email via Resend
        const emailResponse = await sendPasswordResetEmail(email, resetUrl);
        
        if (!emailResponse.success) {
          throw new Error(emailResponse.error || "Falha ao enviar email de recuperação");
        }
        
        response = { error: null };
        console.log("Email de recuperação enviado via Resend");
      } else {
        // Usar o fluxo padrão do Supabase - IMPORTANTE: especificar URL completa para redirecionamento
        const currentUrl = window.location.origin;
        console.log(`Usando URL base para recuperação: ${currentUrl}`);
        
        response = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${currentUrl}/reset-password`,
        });

        if (response.error) {
          console.error('Erro ao solicitar recuperação de senha:', response.error);
          throw response.error;
        }
        
        console.log('Solicitação de recuperação de senha via Supabase bem-sucedida');
      }
      
      setSent(true);
      toast({
        title: "Link de recuperação enviado",
        description: "Verifique sua caixa de entrada (e a pasta de spam) para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      setApiError(error);
      
      if (error.message === 'API key is invalid') {
        setError('A chave API do Resend é inválida. Verifique e atualize a chave API.');
      } else if (error.message?.includes('rate limit')) {
        setError('Muitas solicitações. Aguarde alguns minutos e tente novamente.');
      } else if (error.status === 429) {
        setError('Muitas solicitações. Aguarde alguns minutos e tente novamente.');
      } else if (error.message?.includes('network')) {
        setError('Problema de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError("Não foi possível enviar o link de recuperação. Verifique o email e tente novamente.");
      }
      
      toast({
        title: "Erro",
        description: "Não foi possível enviar o link de recuperação. Verifique o email e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDetailedLogging = () => {
    setDetailedLogging(prev => !prev);
  };
  
  const toggleApiKeyInput = () => {
    setShowApiKeyInput(prev => !prev);
  };
  
  const saveApiKey = () => {
    if (resendApiKey) {
      localStorage.setItem('RESEND_API_KEY', resendApiKey);
      setUseResend(true);
      setShowApiKeyInput(false);
      toast({
        title: "Chave API salva",
        description: "A chave API do Resend foi salva para esta sessão.",
      });
    } else {
      toast({
        title: "Chave API vazia",
        description: "Por favor, insira uma chave API válida.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4" data-cy="forgot-password-form">
      {error && (
        <Alert variant="destructive" className="mb-4" data-cy="email-error-message">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {apiError && (
        <Alert variant="destructive" className="mb-4" data-cy="api-error-message">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {apiError.message || "Ocorreu um erro ao processar sua solicitação"}
          </AlertDescription>
        </Alert>
      )}
      {apiError && detailedLogging && (
        <Alert variant="destructive" className="mb-4 text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro técnico:</strong> {JSON.stringify(apiError)}
          </AlertDescription>
        </Alert>
      )}
      {/* Configuração do Resend API Key */}
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex items-start">
        <InfoIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Serviço de Email: {useResend ? "Resend" : "Supabase"}</p>
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              onClick={toggleApiKeyInput} 
              className="text-xs h-7"
            >
              {showApiKeyInput ? "Ocultar" : "Configurar API Key"}
            </Button>
          </div>
          
          {showApiKeyInput && (
            <div className="space-y-2 mt-2 p-2 bg-white rounded border border-blue-200">
              <p className="text-xs">Insira sua chave API do Resend:</p>
              <div className="flex gap-2">
                <Input 
                  type="password"
                  placeholder="re_123..."
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button 
                  type="button"
                  size="sm" 
                  className="h-8 text-xs" 
                  onClick={saveApiKey}
                >
                  Salvar
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Obtenha sua chave API em{" "}
                <a 
                  href="https://resend.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  resend.com/api-keys
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Resto do formulário */}
      {!sent ? (
        <>
          <div className="space-y-2">
            <label htmlFor={`recovery${userType === 'student' ? 'Student' : 'Parent'}Email`} className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <Input
              id={`recovery${userType === 'student' ? 'Student' : 'Parent'}Email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail cadastrado"
              required
              data-cy="recovery-email-input"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading} data-cy="send-recovery-button">
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
          
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex items-start">
            <InfoIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p>Se você não receber o email, verifique:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Se o email está correto</li>
                <li>A pasta de spam/lixo eletrônico</li>
                <li>Se o email está cadastrado no sistema</li>
              </ul>
              <div className="mt-2 text-xs text-blue-700 flex justify-between items-center">
                <Link to="/email-diagnostic" className="underline" data-cy="email-diagnostic-link">
                  Diagnóstico do sistema de email
                </Link>
                <button
                  type="button" 
                  onClick={toggleDetailedLogging}
                  className="text-xs text-blue-600"
                >
                  {detailedLogging ? 'Desativar logs' : 'Ativar logs detalhados'}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4" data-cy="success-message">
          <p className="mb-4">Link de recuperação enviado para <strong>{email}</strong></p>
          <p className="text-sm text-gray-600 mb-4">
            Verifique sua caixa de entrada (e também a pasta de spam) e siga as instruções para redefinir sua senha.
          </p>
          <div className="space-y-3">
            <Button onClick={() => setEmail('')} variant="outline" className="mt-2">
              Tentar com outro email
            </Button>
            
            <div>
              <Link to="/password-reset-test" className="text-xs text-blue-600 block mt-2">
                Não recebeu? Execute o teste de diagnóstico completo
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
          data-cy="back-to-login-button"
        >
          Voltar para o login
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;

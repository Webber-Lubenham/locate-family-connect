
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { UserType } from '@/lib/auth-redirects';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, InfoIcon } from "lucide-react";
import { Link } from "react-router-dom";

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
      
      // Use the client property to access Supabase methods
      const { error } = await supabase.client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        console.error('Erro ao solicitar recuperação de senha:', error);
        throw error;
      }

      console.log('Solicitação de recuperação de senha bem-sucedida');
      setSent(true);
      toast({
        title: "Link de recuperação enviado",
        description: "Verifique sua caixa de entrada (e a pasta de spam) para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      setApiError(error);
      
      if (error.message === 'API key is invalid') {
        setError('O sistema de envio de emails está com problema de configuração. Entre em contato com o suporte.');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          
          {apiError && (
            <div className="mt-2">
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
                <pre className="mt-2 p-2 bg-red-950 text-white rounded overflow-auto max-h-24">
                  {JSON.stringify(apiError, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </Alert>
      )}
      
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
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
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
              <div className="mt-2 text-xs text-blue-700">
                <Link to="/email-diagnostic" className="underline">
                  Diagnóstico do sistema de email
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="mb-4">Link de recuperação enviado para <strong>{email}</strong></p>
          <p className="text-sm text-gray-600 mb-4">
            Verifique sua caixa de entrada (e também a pasta de spam) e siga as instruções para redefinir sua senha.
          </p>
          <Button onClick={() => setEmail('')} variant="outline" className="mt-2">
            Tentar com outro email
          </Button>
        </div>
      )}
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
        >
          Voltar para o login
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;

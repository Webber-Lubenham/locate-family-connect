
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  console.log('[ResetPassword] Inicializando componente de redefinição de senha');
  console.log('[ResetPassword] URL params:', Object.fromEntries(searchParams.entries()));

  // Verificar se temos parâmetros na URL e se a sessão já está configurada
  useEffect(() => {
    const checkSession = async () => {
      console.log('[ResetPassword] Verificando sessão e parâmetros URL...');
      
      // Verifica se há um token na URL - isto acontece quando o usuário clica no link de email
      const token = searchParams.get('token');
      
      if (token) {
        console.log('[ResetPassword] Token encontrado na URL');
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery',
          });
          
          if (error) {
            console.error('[ResetPassword] Erro ao verificar token:', error);
            setError(`Link de recuperação inválido ou expirado. ${error.message}`);
            toast({
              title: 'Erro de verificação',
              description: 'O link de recuperação é inválido ou expirou. Por favor, solicite um novo link.',
              variant: 'destructive',
            });
          } else {
            console.log('[ResetPassword] Token verificado com sucesso');
          }
        } catch (err: any) {
          console.error('[ResetPassword] Erro na verificação do token:', err);
          setError('Ocorreu um erro ao verificar o link de recuperação.');
        }
      } else {
        // Verificamos se já temos uma sessão válida para redefinição
        const { data } = await supabase.auth.getSession();
        console.log('[ResetPassword] Estado atual da sessão:', data?.session ? 'Ativa' : 'Inativa');
      }
    };
    
    checkSession();
  }, [searchParams, toast]);

  // Redirecionamento após sucesso
  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Usar window.location.href para garantir um redirecionamento completo
            window.location.href = '/login';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ResetPassword] Iniciando processo de redefinição de senha');
    setError(null);

    // Validação de senha
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      console.log('[ResetPassword] Enviando atualização de senha para Supabase');
      
      // Usamos o updateUser para definir uma nova senha
      const { error: resetError } = await supabase.auth.updateUser({
        password: password
      });

      if (resetError) {
        console.error('[ResetPassword] Erro ao redefinir senha:', resetError);
        throw resetError;
      }

      console.log('[ResetPassword] Senha atualizada com sucesso!');
      setSuccess(true);
      toast({
        title: 'Senha alterada com sucesso',
        description: 'Sua senha foi atualizada. Você será redirecionado para a página de login em breve.',
      });
    } catch (error: any) {
      console.error('[ResetPassword] Erro na redefinição de senha:', error);
      setError(
        error.message === 'Invalid user' 
        ? 'Link de redefinição inválido ou expirado. Solicite um novo link.'
        : 'Ocorreu um erro ao redefinir sua senha. Tente novamente.'
      );
      
      toast({
        title: 'Erro na redefinição',
        description: error.message || 'Ocorreu um erro ao redefinir sua senha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-cy="reset-password-page">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4" data-cy="token-error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription data-cy={error?.includes('não coincidem') ? 'password-mismatch-error' : error?.includes('8 caracteres') ? 'password-length-error' : 'generic-error'}>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center space-y-4" data-cy="password-reset-success">
              <div className="text-green-500 flex justify-center" data-cy="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Senha alterada com sucesso!</h3>
              <p className="text-sm" data-cy="redirect-message">
                Redirecionando para a página de login em {countdown} segundos...
              </p>
              <div className="pt-2">
                <Button 
                  onClick={() => window.location.href = '/login'} 
                  variant="outline" 
                  className="mt-2"
                  data-cy="go-to-login-button"
                >
                  Ir para o login agora
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-cy="reset-password-form">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    data-cy="new-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    data-cy="confirm-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                data-cy="reset-password-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aguarde...
                  </>
                ) : 'Redefinir senha'}
              </Button>
              
              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-blue-600 hover:underline">
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
          
          {error?.includes('expirado') && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Precisa de um novo link de recuperação?
              </p>
              <Link to="/login" className="text-blue-600 hover:underline">
                Solicitar novo link de recuperação
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

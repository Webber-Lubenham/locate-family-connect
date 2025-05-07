
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
      
      // Use updateUser for defining a new password
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
              <AlertDescription data-cy="error-message">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="space-y-4" data-cy="success-section">
              <div className="text-center">
                <p className="text-green-600 font-medium" data-cy="success-message">
                  Senha redefinida com sucesso!
                </p>
                <p className="text-sm text-muted-foreground" data-cy="countdown-text">
                  Você será redirecionado para o login em {countdown} segundos...
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                data-cy="go-to-login-button"
              >
                Ir para login agora
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" data-cy="password-label">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite sua nova senha"
                    data-cy="password-input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    data-cy="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" data-cy="confirm-password-label">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirme sua nova senha"
                    data-cy="confirm-password-input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-cy="toggle-confirm-password-visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !password || !confirmPassword}
                data-cy="submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </Button>
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
        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-sm text-primary hover:underline" data-cy="back-to-login-link">
            Voltar para login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
};

export default ResetPassword;

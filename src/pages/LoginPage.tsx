
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect user if already logged in
  useEffect(() => {
    if (user) {
      redirectBasedOnUserType(user);
    }
  }, [user, navigate]);

  // Helper function to redirect based on user type
  const redirectBasedOnUserType = (currentUser: any) => {
    console.log('[LOGIN] Redirecionando com base no tipo de usuário:', currentUser?.user_type);
    
    if (currentUser?.user_type === 'student') {
      console.log('[LOGIN] Redirecionando para dashboard de estudante');
      navigate('/student/dashboard');
    } else if (currentUser?.user_type === 'parent' || currentUser?.user_type === 'guardian') {
      console.log('[LOGIN] Redirecionando para dashboard de responsável');
      navigate('/guardian/dashboard');
    } else if (currentUser?.user_type === 'developer') {
      console.log('[LOGIN] Redirecionando para dashboard de desenvolvedor');
      navigate('/developer/flow');
    } else {
      console.log('[LOGIN] Tipo de usuário desconhecido, redirecionando para página de perfil');
      navigate('/profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('[LOGIN] Iniciando processo de login com email:', email);
    console.log('[LOGIN] Estado de carregamento:', isLoading);
    console.log('[LOGIN] Verificando função signIn disponível:', !!signIn);

    try {
      console.log('[LOGIN] Chamando signIn...');
      const result = await signIn(email, password);
      console.log('[LOGIN] Resultado do signIn:', result);
      
      if (result.error) {
        console.error('[LOGIN] Erro retornado pelo signIn:', result.error);
        toast({
          title: "Erro ao fazer login",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('[LOGIN] Login bem-sucedido');
        // O redirecionamento será feito pelo useEffect quando o user for atualizado
      }
    } catch (error: any) {
      console.error('[LOGIN] Exceção no processo de login:', error);
      console.error('[LOGIN] Stack trace:', error?.stack);
      toast({
        title: "Erro ao fazer login",
        description: error?.message || 'Erro desconhecido no processo de login',
        variant: "destructive"
      });
    } finally {
      console.log('[LOGIN] Finalizando processo de login, isLoading =', false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com seu email e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/password-recovery" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Registre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;

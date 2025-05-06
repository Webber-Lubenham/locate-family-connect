
import React, { useState } from 'react';
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
        console.log('[LOGIN] Login bem-sucedido, redirecionando para dashboard');
        
        // Buscar o tipo de usuário para redirecionamento correto
        const userProfile = result.data?.user?.user_metadata?.user_type || 
                          result.data?.session?.user?.user_metadata?.user_type;
        
        console.log('[LOGIN] Tipo de usuário detectado:', userProfile);
        
        if (userProfile === 'student') {
          navigate('/student-dashboard');
        } else if (userProfile === 'parent') {
          navigate('/parent-dashboard');
        } else {
          // Fallback se não conseguir determinar o tipo de usuário
          console.warn('[LOGIN] Não foi possível determinar o tipo de usuário, verificando perfil');
          
          // Aguardar a atualização do contexto de autenticação
          setTimeout(() => {
            const authUser = useAuth().user;
            if (authUser?.user_type === 'student') {
              navigate('/student-dashboard');
            } else if (authUser?.user_type === 'parent') {
              navigate('/parent-dashboard');
            } else {
              navigate('/profile'); // Página de perfil como fallback
            }
          }, 500); // Pequeno delay para garantir que o contexto de auth seja atualizado
        }
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

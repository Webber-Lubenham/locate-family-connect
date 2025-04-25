
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
const supabase = getSupabaseClient();
import { useToast } from '../components/ui/use-toast';
import { useUser } from '../contexts/UserContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const email = (e.target as HTMLFormElement).email.value;
    const password = (e.target as HTMLFormElement).password.value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const authUser = data.user;
      if (!authUser) throw new Error('Usuário não encontrado');

      console.log('Login bem-sucedido:', authUser);
      
      // Update context with user metadata
      updateUser({
        ...authUser,
        user_type: authUser.user_metadata?.user_type || 'student',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        phone: authUser.user_metadata?.phone || null
      });

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
        variant: "default"
      });

      // Short timeout to allow context update
      setTimeout(() => {
        const userType = authUser.user_metadata?.user_type || 'student';
        console.log('Redirecionando para:', userType);
        
        switch (userType) {
          case 'student':
            navigate('/student-dashboard');
            break;
          case 'parent':
            navigate('/parent-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }, 500);
    } catch (error: any) {
      console.error('Erro de login:', error);

      let errorMessage = 'Ocorreu um erro ao realizar o login.';

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Por favor, verifique suas credenciais.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
      }

      setError(errorMessage);

      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Fazer Login</CardTitle>
          <CardDescription>
            Entre com seu email e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">✓</span>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-800">
                Cadastre-se
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

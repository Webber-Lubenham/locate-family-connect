
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/use-toast';
import { useUser, User } from '../contexts/UserContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Get any query parameters (e.g., from redirects)
  const queryParams = new URLSearchParams(location.search);
  const redirectMessage = queryParams.get('message');

  useEffect(() => {
    console.log('[LOGIN] Login page mounted');
    if (redirectMessage) {
      console.log(`[LOGIN] Redirect message present: ${redirectMessage}`);
      toast({
        title: "Atenção",
        description: redirectMessage,
        variant: "default"
      });
    }
    
    return () => {
      console.log('[LOGIN] Login page unmounted');
    };
  }, [redirectMessage, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formElement = e.target as HTMLFormElement;
    const email = formElement.email.value;
    const password = formElement.password.value;

    console.log(`[LOGIN] Attempting login for email: ${email}`);

    try {
      const { data, error } = await supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error(`[LOGIN] Authentication error: ${error.message}`);
        throw error;
      }

      const authUser = data.user;
      if (!authUser) {
        console.error('[LOGIN] No user returned after successful login');
        throw new Error('Usuário não encontrado');
      }

      console.log('[LOGIN] Login successful, user ID:', authUser.id);
      
      // Update context with user metadata as a properly typed User object
      const userMetadata: User = {
        id: authUser.id,
        email: authUser.email,
        user_metadata: authUser.user_metadata,
        user_type: authUser.user_metadata?.user_type || 'student',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        phone: authUser.user_metadata?.phone || null
      };
      
      console.log('[LOGIN] Updating user context with metadata:', userMetadata.user_type);
      updateUser(userMetadata);

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
        variant: "default"
      });

      // Short timeout to allow context update
      setTimeout(() => {
        const userType = authUser.user_metadata?.user_type || 'student';
        console.log('[LOGIN] Redirecting user to dashboard, userType:', userType);
        
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
      console.error('[LOGIN] Login error:', error);

      let errorMessage = 'Ocorreu um erro ao realizar o login.';

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Por favor, verifique suas credenciais.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
      }

      setError(errorMessage);
      console.error(`[LOGIN] Showing error message: ${errorMessage}`);

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


import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES, isValidUserType } from '@/lib/auth-redirects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signIn } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect user if already logged in
  useEffect(() => {
    console.log('[LOGIN_PAGE] Auth check triggered. User:', user?.id, 'Loading:', loading);
    
    if (loading) {
      console.log('[LOGIN_PAGE] Auth still loading, waiting...');
      return; // Wait until auth check completes
    }
    
    if (user) {
      // Get user type from profile or metadata
      const userTypeString = user.user_type || 
                             user.user_metadata?.user_type as string || 
                             user.app_metadata?.user_type as string;
      
      console.log('[LOGIN_PAGE] User authenticated, user type:', userTypeString);
      
      if (!userTypeString || !isValidUserType(userTypeString)) {
        // If no user type, redirect to profile to complete registration
        console.log('[LOGIN_PAGE] No valid user type found, redirecting to profile');
        navigate('/profile', { replace: true });
        return;
      }
      
      // Get the appropriate dashboard route
      const dashboardRoute = DASHBOARD_ROUTES[userTypeString];
      
      console.log('[LOGIN_PAGE] Redirecting to:', dashboardRoute);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('[LOGIN_PAGE] Login attempt with email:', email);

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        console.error('[LOGIN_PAGE] Login error:', result.error);
        toast({
          title: "Erro ao fazer login",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('[LOGIN_PAGE] Login successful');
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        // Redirection will be handled by the useEffect when user state updates
      }
    } catch (error: any) {
      console.error('[LOGIN_PAGE] Exception during login:', error);
      toast({
        title: "Erro ao fazer login",
        description: error?.message || 'Erro desconhecido no processo de login',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading indicator while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If already authenticated, don't show the login form (will be redirected by useEffect)
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md" data-cy="login-page">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com seu email e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-cy="login-form">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-cy="email-input"
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
                data-cy="password-input"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-cy="submit-button"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/register" className="text-sm text-blue-600 hover:text-blue-800" data-cy="register-link">
            Não tem uma conta? Cadastre-se
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;

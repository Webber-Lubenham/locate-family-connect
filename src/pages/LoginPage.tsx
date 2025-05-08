import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES, isValidUserType } from '@/lib/auth-redirects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DebugPanel } from '@/components/DebugPanel';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const { user, loading, signIn } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  
  // Debugging function
  const updateDebugInfo = (info: any) => {
    console.log('[DEBUG]', info);
    setDebugInfo(prev => ({ ...prev, ...info }));
  };

  // Toggle debug panel
  const toggleDebug = () => {
    setShowDebug(prev => !prev);
  };

  // Redirect user if already logged in
  useEffect(() => {
    updateDebugInfo({ authCheckTriggered: true, userPresent: !!user, loading });
    
    if (loading) return; // Wait until auth check completes
    
    if (user) {
      // Get user type from profile or metadata
      const userTypeString = user.user_type || 
                             user.user_metadata?.user_type as string || 
                             user.app_metadata?.user_type as string;
      
      if (!userTypeString || !isValidUserType(userTypeString)) {
        // If no user type, redirect to profile to complete registration
        console.log('[LOGIN] User type not found, redirecting to profile');
        navigate('/profile', { replace: true });
        return;
      }
      
      // Get the appropriate dashboard route
      const dashboardRoute = DASHBOARD_ROUTES[userTypeString];
      
      updateDebugInfo({ 
        redirectTriggered: true, 
        userType: userTypeString,
        userId: user.id,
        email: user.email,
        redirectPath: dashboardRoute
      });
      
      console.log('[LOGIN] User authenticated, redirecting to:', dashboardRoute);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    updateDebugInfo({ 
      loginAttempt: true, 
      email, 
      timestamp: new Date().toISOString()
    });
    
    console.log('[LOGIN] Iniciando processo de login com email:', email);

    try {
      console.log('[LOGIN] Chamando signIn...');
      const result = await signIn(email, password);
      
      updateDebugInfo({ 
        signInCompleted: true,
        hasError: !!result.error,
        errorMessage: result.error?.message
      });
      
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
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
      }
    } catch (error: any) {
      console.error('[LOGIN] Exceção no processo de login:', error);
      console.error('[LOGIN] Stack trace:', error?.stack);
      
      updateDebugInfo({ 
        loginException: true,
        exceptionMessage: error?.message,
        stack: error?.stack
      });
      
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
      <Card className="w-full max-w-md" data-cy="login-page">
        <CardHeader>
          <CardTitle className="text-2xl" data-cy="login-title">Login</CardTitle>
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
          
          {/* Debug button - visible in development and production for now */}
          <div className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full text-xs"
              onClick={toggleDebug}
            >
              {showDebug ? 'Esconder Debug' : 'Mostrar Debug'}
            </Button>
            
            {showDebug && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Link to="/register" className="text-sm text-blue-600 hover:text-blue-800" data-cy="register-link">
            Não tem uma conta? Cadastre-se
          </Link>
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800" data-cy="forgot-password-link">
            Esqueceu a senha?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;

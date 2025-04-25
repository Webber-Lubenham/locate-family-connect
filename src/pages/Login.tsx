
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
import { useUser } from '../contexts/UserContext';
import AuthContainer from '../components/AuthContainer';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  
  const queryParams = new URLSearchParams(location.search);
  const redirectMessage = queryParams.get('message');

  // Verificar sessão na montagem
  useEffect(() => {
    console.log('[LOGIN] Login page mounted');
    
    const checkSession = async () => {
      try {
        // Verificar sessão de forma direta
        const { data } = await supabase.client.auth.getSession();
        const session = data?.session;
        
        if (session?.user) {
          console.log('[LOGIN] User already authenticated, redirecting:', session.user);
          
          // Atualizar o contexto com os dados do usuário
          updateUser({
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
            user_type: session.user.user_metadata?.user_type || 'student',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone || null,
          });
          
          // Redirecionar com base no tipo de usuário
          redirectToDashboard(session.user.user_metadata?.user_type || 'student');
        } else {
          console.log('[LOGIN] No active session found');
          setIsSessionChecked(true);
        }
      } catch (error) {
        console.error('[LOGIN] Error checking session:', error);
        setIsSessionChecked(true);
      }
    };
    
    checkSession();
    
    // Mostrar mensagem de redirecionamento se houver
    if (redirectMessage) {
      console.log(`[LOGIN] Redirect message present: ${redirectMessage}`);
      toast({
        title: "Atenção",
        description: redirectMessage,
        variant: "default"
      });
    }
  }, [redirectMessage, toast, updateUser]);

  // Função para redirecionamento baseado no tipo de usuário
  const redirectToDashboard = (userType: string) => {
    switch (userType) {
      case 'student':
        navigate('/student-dashboard', { replace: true });
        break;
      case 'parent':
        navigate('/parent-dashboard', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
    }
  };

  // Verificação reativa quando o usuário é atualizado
  useEffect(() => {
    if (user && isSessionChecked) {
      console.log('[LOGIN] User context updated, redirecting:', user);
      const userType = user.user_type || 'student';
      redirectToDashboard(userType);
    }
  }, [user, isSessionChecked, navigate]);

  // Em caso de erro de autenticação
  const handleAuthError = () => {
    setError('Sua sessão expirou ou não é válida. Por favor, faça login novamente.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {error && (
        <Alert variant="destructive" className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <AuthContainer initialScreen="login" />
    </div>
  );
};

export default Login;

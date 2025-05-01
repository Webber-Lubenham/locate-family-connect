
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUser, User } from '@/contexts/UserContext';
import { useDevice } from '@/hooks/use-mobile';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  userType: 'student' | 'parent';
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  userType,
  onRegisterClick,
  onForgotPasswordClick,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const { isXs, isXxs, orientation, type: deviceType } = useDevice();

  // Get responsive spacing
  const getSpacing = () => {
    if (isXxs) return 'space-y-3';
    if (isXs) return orientation === 'landscape' ? 'space-y-2' : 'space-y-3';
    return 'space-y-4';
  };
  
  // Get responsive font sizes for labels
  const getLabelSize = () => {
    if (isXxs || (isXs && orientation === 'landscape')) {
      return 'text-xs';
    }
    return 'text-sm';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      console.log(`[LOGIN] Attempting login with email: ${email} and userType: ${userType}`);
      
      const { data, error } = await supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const authUser = data.user;
      if (!authUser) throw new Error('Usuário não encontrado');

      console.log('[LOGIN] Login successful, user:', authUser);
      
      // Update context with mapped user data
      const userData: User = {
        id: authUser.id,
        email: authUser.email,
        user_metadata: authUser.user_metadata,
        user_type: authUser.user_metadata?.user_type || userType || 'student', // Use form userType as fallback
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        phone: authUser.user_metadata?.phone || null
      };
      
      updateUser(userData);

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo de volta!`,
      });
      
      // Add a small delay before redirection to ensure context is updated
      setTimeout(() => {
        // Redirecionamento baseado no tipo de usuário
        const effectiveUserType = userData.user_type || userType;
        console.log(`[LOGIN] Redirecting to dashboard for user type: ${effectiveUserType}`);
        
        switch (effectiveUserType) {
          case 'student':
            navigate('/student-dashboard', { replace: true });
            break;
          case 'parent':
            navigate('/parent-dashboard', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      }, 500);
    } catch (error: any) {
      console.error('[LOGIN] Login error:', error);
      
      let errorMessage = 'Ocorreu um erro ao realizar o login.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Por favor, verifique suas credenciais.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Por favor, verifique sua caixa de entrada.';
      }
      
      setError(errorMessage);
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get appropriate button size based on device
  const getButtonSize = () => {
    if (isXxs || (isXs && orientation === 'landscape')) {
      return 'size-xs';
    }
    if (deviceType === 'mobile') {
      return 'size-mobile';
    }
    return undefined; // default
  };

  return (
    <form onSubmit={handleSubmit} className={getSpacing()}>
      {error && (
        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1 sm:space-y-2">
        <label htmlFor={`${userType}Email`} className={`block ${getLabelSize()} font-medium text-gray-700`}>
          E-mail
        </label>
        <Input
          id={`${userType}Email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu.email@exemplo.com"
          required
          autoComplete="email"
          className={isXxs ? 'text-sm' : ''}
        />
      </div>
      
      <div className="space-y-1 sm:space-y-2">
        <label htmlFor={`${userType}Password`} className={`block ${getLabelSize()} font-medium text-gray-700`}>
          Senha
        </label>
        <div className="relative">
          <Input
            id={`${userType}Password`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
            autoComplete="current-password"
            className={isXxs ? 'text-sm pr-8' : 'pr-8'}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? 
              <EyeOff className={`${isXxs ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} /> : 
              <Eye className={`${isXxs ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
            }
          </button>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={loading}
        size={getButtonSize()}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
      
      <div className={`text-center mt-2 sm:mt-4 ${isXxs ? 'space-y-2' : 'space-y-3'}`}>
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className={`${isXxs ? 'text-xs' : 'text-sm'} text-blue-600 hover:underline focus:outline-none`}
        >
          Esqueceu a senha?
        </button>
        
        <p className={`${isXxs ? 'text-xs' : 'text-sm'} text-gray-600 mt-2`}>
          Não tem uma conta?{' '}
          <button type="button" onClick={onRegisterClick} className="text-blue-600 hover:underline focus:outline-none">
            Cadastre-se
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;

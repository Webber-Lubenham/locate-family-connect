import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUser } from '@/contexts/UnifiedAuthContext';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useDevice } from '@/hooks/use-mobile';
import { Eye, EyeOff } from 'lucide-react';
import { UserType } from '@/lib/auth-redirects';
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";

export interface LoginFormProps {
  userType: UserType;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
  variant?: 'login' | 'register';
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

  // Get responsive spacing with improved portrait mode
  const getSpacing = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'space-y-4';
      if (isXs) return 'space-y-5';
      return 'space-y-6';
    } else {
      // Landscape orientation
      if (isXxs) return 'space-y-3';
      if (isXs) return 'space-y-2';
      return 'space-y-4';
    }
  };
  
  // Get responsive font sizes for labels with improved portrait mode
  const getLabelSize = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'text-sm';
      return 'text-base';
    } else {
      // Landscape orientation
      if (isXxs || (isXs && orientation === 'landscape')) {
        return 'text-xs';
      }
      return 'text-sm';
    }
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
      
      // Just pass the auth user directly
      updateUser(authUser);
      
      // Ensure user_metadata has user_type
      if (!authUser.user_metadata?.user_type) {
        console.log(`[LOGIN] Setting default user type: ${userType}`);
        // If no user type in metadata, we'll use the form's selected type for navigation
      }

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo de volta!`,
      });
      
      // Add a small delay before redirection to ensure context is updated
      setTimeout(() => {
        // Redirecionamento baseado no tipo de usuário
        const effectiveUserType = authUser.user_metadata?.user_type || userType;
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

  // Get appropriate button size based on device with improved portrait mode
  const getButtonSize = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'sm';
      if (isXs) return 'default';
      return 'lg';
    } else {
      // Landscape orientation
      if (isXxs || (isXs && orientation === 'landscape')) {
        return 'xs';
      }
      if (deviceType === 'mobile') {
        return 'mobile';
      }
      return undefined; // default
    }
  };
  
  // Get input sizing for portrait mode
  const getInputClass = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'text-sm py-2';
      return '';
    } else {
      return isXxs ? 'text-sm' : '';
    }
  };
  
  // Get forgot password and register link spacing
  const getActionLinksSpacing = () => {
    if (orientation === 'portrait') {
      return isXxs ? 'space-y-3 mt-4' : 'space-y-4 mt-6';
    } else {
      return `${isXxs ? 'space-y-2' : 'space-y-3'} mt-2 sm:mt-4`;
    }
  };
  
  // Get links font size
  const getLinksSize = () => {
    if (orientation === 'portrait') {
      return isXxs ? 'text-sm' : 'text-base';
    } else {
      return isXxs ? 'text-xs' : 'text-sm';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={getSpacing()} data-cy="login-form">
      {error && (
        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm" data-cy="login-error-message">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label className={getLabelSize()} htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn("w-full", getInputClass())}
          placeholder="seu@email.com"
          disabled={loading}
          data-cy="email-input"
        />
      </div>

      <div className="space-y-2">
        <Label className={getLabelSize()} htmlFor="password">
          Senha
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn("w-full pr-10", getInputClass())}
            placeholder="••••••••"
            disabled={loading}
            data-cy="password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            data-cy="toggle-password-visibility"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        size={getButtonSize()}
        className="w-full"
        disabled={loading}
        data-cy="submit-button"
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className={cn("flex flex-col items-center", getActionLinksSpacing())}>
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className={cn(
            "text-blue-600 hover:text-blue-700 transition-colors",
            getLinksSize()
          )}
          data-cy="forgot-password-link"
        >
          Esqueceu sua senha?
        </button>
        
        <button
          type="button"
          onClick={onRegisterClick}
          className={cn(
            "text-blue-600 hover:text-blue-700 transition-colors",
            getLinksSize()
          )}
          data-cy="register-link"
        >
          Não tem uma conta? Registre-se
        </button>
      </div>
    </form>
  );
};

export default LoginForm;

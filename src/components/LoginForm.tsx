import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUser, User } from '@/contexts/UserContext';
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
    <form onSubmit={handleSubmit} className={getSpacing()}>
      {error && (
        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label className={getLabelSize()}>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={getInputClass()}
          placeholder="seu@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className={getLabelSize()}>Senha</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={getInputClass()}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        variant="login"
        size={getButtonSize()}
        className="w-full"
      >
        {loading ? (
          <>
            <span className="mr-2">Entrando</span>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <div className={getActionLinksSpacing()}>
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className={cn(
            "w-full text-center hover:underline",
            getLinksSize(),
            "text-blue-600 hover:text-blue-700"
          )}
        >
          Esqueceu sua senha?
        </button>

        <button
          type="button"
          onClick={onRegisterClick}
          className={cn(
            "w-full text-center hover:underline",
            getLinksSize(),
            "text-blue-600 hover:text-blue-700"
          )}
        >
          Não tem uma conta? Cadastre-se
        </button>
      </div>
    </form>
  );
};

export default LoginForm;

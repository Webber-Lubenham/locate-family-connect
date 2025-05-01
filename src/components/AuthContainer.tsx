import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import AuthTabs from './AuthTabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useToast } from "@/components/ui/use-toast";
import { useDevice } from '@/hooks/use-mobile';
import { authContainerVariants, authHeaderVariants, authButtonVariants } from '@/lib/auth-styles';
import { cn } from '@/lib/utils';
import { UserType } from '@/lib/auth-redirects';

type AuthScreen = 'login' | 'register' | 'forgotPassword';

interface AuthContainerProps {
  initialScreen?: AuthScreen;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ initialScreen = 'login' }) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initialScreen);
  const [userType, setUserType] = useState<UserType>('student');
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    type: deviceType, 
    orientation, 
    isXs, 
    isXxs, 
    aspectRatio 
  } = useDevice();

  const getContainerPadding = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'p-2 py-4';
      if (isXs) return 'p-3 py-5';
      if (deviceType === 'mobile') return 'p-4 py-6';
      return 'p-4 md:p-6';
    } else {
      if (isXxs) return 'p-1';
      if (isXs) return 'p-1.5'; 
      if (deviceType === 'mobile') return 'p-2';
      return 'p-4 md:p-6';
    }
  };
  
  const getTitleSize = () => {
    if (orientation === 'portrait') {
      if (isXxs) return 'text-lg';
      if (isXs) return 'text-xl';
      if (deviceType === 'mobile') return 'text-2xl';
      return 'text-2xl md:text-3xl';
    } else {
      if (isXxs) return 'text-base';
      if (isXs) return 'text-base';
      if (deviceType === 'mobile') return 'text-lg';
      return 'text-xl md:text-2xl';
    }
  };
  
  const getLandscapeStyles = () => {
    if (orientation === 'landscape' && (isXs || isXxs || (deviceType === 'mobile' && aspectRatio > 1.8))) {
      return 'my-1 py-1 max-h-[90vh] overflow-y-auto';
    }
    
    if (orientation === 'portrait') {
      return 'my-4 md:my-8';
    }
    
    return '';
  };
  
  const containerClasses = cn(
    authContainerVariants({
      type: currentScreen === 'register' ? 'register' : 'login',
      userType
    }),
    getContainerPadding(),
    getLandscapeStyles()
  );

  const headerClasses = cn(
    authHeaderVariants({
      type: currentScreen === 'register' ? 'register' : 'login',
      userType
    }),
    getTitleSize()
  );
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    setCurrentScreen(initialScreen);
  }, [initialScreen]);
  
  const handleTabChange = (tab: UserType) => {
    setUserType(tab);
  };
  
  const renderScreenTitle = () => {
    switch (currentScreen) {
      case 'login':
        return 'Entrar';
      case 'register':
        return 'Criar Conta';
      case 'forgotPassword':
        return 'Recuperar Senha';
      default:
        return '';
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };
  
  const renderScreenContent = () => {
    if (!isLoaded) {
      return (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className={cn(
            "animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2",
            currentScreen === 'register' ? 'border-emerald-500' : 'border-blue-500'
          )}></div>
        </div>
      );
    }
    
    const type = currentScreen === 'register' ? 'register' : 'login';
    
    switch (currentScreen) {
      case 'login':
        return (
          <LoginForm
            userType={userType}
            onRegisterClick={() => navigate('/register')}
            onForgotPasswordClick={() => setCurrentScreen('forgotPassword')}
            variant={type}
          />
        );
      case 'register':
        return (
          <RegisterForm
            userType={userType}
            onLoginClick={handleLoginClick}
            variant={type}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPasswordForm
            userType={userType}
            onBackToLogin={() => setCurrentScreen('login')}
            variant={type}
          />
        );
      default:
        return null;
    }
  };
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      toast({
        title: "Erro na aplicação",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [toast]);

  return (
    <div className={containerClasses}>
      <div className={cn(
        "w-full max-w-sm mx-auto",
        currentScreen === 'register' ? 'space-y-6' : 'space-y-4'
      )}>
        <div className={cn(
          "flex flex-col items-center",
          currentScreen === 'register' ? 'mb-8' : 'mb-6'
        )}>
          <Logo 
            className={cn(
              "w-auto",
              currentScreen === 'register' ? 'h-12 md:h-16' : 'h-10 md:h-14'
            )} 
          />
          <h1 className={headerClasses}>
            {renderScreenTitle()}
          </h1>
        </div>

        <AuthTabs
          activeTab={userType}
          onTabChange={handleTabChange}
          variant={currentScreen === 'register' ? 'register' : 'login'}
        />

        {renderScreenContent()}
      </div>
    </div>
  );
};

export default AuthContainer;

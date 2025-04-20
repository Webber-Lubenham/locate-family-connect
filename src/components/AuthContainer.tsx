
import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import AuthTabs from './AuthTabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useToast } from "@/components/ui/use-toast";

type AuthScreen = 'login' | 'register' | 'forgotPassword';

const AuthContainer: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [userType, setUserType] = useState<'student' | 'parent'>('student');
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate a short delay to ensure all resources are loaded
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTabChange = (tab: 'student' | 'parent') => {
    setUserType(tab);
  };
  
  const renderScreenTitle = () => {
    switch (currentScreen) {
      case 'login':
        return 'Login';
      case 'register':
        return 'Cadastro';
      case 'forgotPassword':
        return 'Recuperação de Senha';
      default:
        return '';
    }
  };
  
  const renderScreenContent = () => {
    if (!isLoaded) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    switch (currentScreen) {
      case 'login':
        return (
          <LoginForm
            userType={userType}
            onRegisterClick={() => setCurrentScreen('register')}
            onForgotPasswordClick={() => setCurrentScreen('forgotPassword')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            userType={userType}
            onLoginClick={() => setCurrentScreen('login')}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPasswordForm
            userType={userType}
            onBackToLogin={() => setCurrentScreen('login')}
          />
        );
      default:
        return null;
    }
  };
  
  // Error boundary to prevent blank screens
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Logo />
        <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {renderScreenTitle()}
          </h2>
          
          <AuthTabs
            activeTab={userType}
            onTabChange={handleTabChange}
          />
          
          {renderScreenContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;

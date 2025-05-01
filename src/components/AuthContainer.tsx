
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import AuthTabs from './AuthTabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useToast } from "@/components/ui/use-toast";
import { useDevice } from '@/hooks/use-mobile';

type AuthScreen = 'login' | 'register' | 'forgotPassword';

interface AuthContainerProps {
  initialScreen?: AuthScreen;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ initialScreen = 'login' }) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initialScreen);
  const [userType, setUserType] = useState<'student' | 'parent'>('student');
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    type: deviceType, 
    orientation, 
    isXs, 
    isXxs, 
    aspectRatio, 
    width, 
    height 
  } = useDevice();
  
  // Update orientation when user rotates the device
  useEffect(() => {
    const handleResize = () => {
      // This will be handled by useDevice hook now
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Simulate a short delay to ensure all resources are loaded
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update currentScreen when initialScreen prop changes
  useEffect(() => {
    setCurrentScreen(initialScreen);
  }, [initialScreen]);
  
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

  const handleLoginClick = () => {
    navigate('/login');
  };
  
  // Enhanced container padding logic based on device size and orientation
  const getContainerPadding = () => {
    if (isXxs) {
      return orientation === 'landscape' ? 'p-1' : 'p-2';
    }
    
    if (isXs) {
      return orientation === 'landscape' ? 'p-1.5' : 'p-3';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? 'p-2' : 'p-4';
    }
    
    return 'p-4 md:p-6';
  };
  
  // Enhanced title size based on device size and orientation
  const getTitleSize = () => {
    if (isXxs) {
      return 'text-base';
    }
    
    if (isXs) {
      return orientation === 'landscape' ? 'text-base' : 'text-lg';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? 'text-lg' : 'text-xl';
    }
    
    return 'text-xl md:text-2xl';
  };
  
  // Enhanced card padding based on device size and orientation
  const getCardPadding = () => {
    if (isXxs) {
      return 'p-2';
    }
    
    if (isXs) {
      return orientation === 'landscape' ? 'p-2.5' : 'p-3';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? 'p-3' : 'p-4';
    }
    
    return 'p-4 md:p-6';
  };
  
  // Additional margin adjustment for landscape mode on small screens
  const getLandscapeStyles = () => {
    if (orientation === 'landscape' && (isXs || isXxs || (deviceType === 'mobile' && aspectRatio > 1.8))) {
      return 'my-1 py-1 max-h-[90vh] overflow-y-auto';
    }
    return '';
  };
  
  const renderScreenContent = () => {
    if (!isLoaded) {
      return (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    switch (currentScreen) {
      case 'login':
        return (
          <LoginForm
            userType={userType}
            onRegisterClick={() => navigate('/register')}
            onForgotPasswordClick={() => setCurrentScreen('forgotPassword')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            userType={userType}
            onLoginClick={handleLoginClick}
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
    <div className={`min-h-screen flex items-center justify-center ${getContainerPadding()}`}>
      <div className={`w-full max-w-md ${getLandscapeStyles()}`}>
        {/* Fix: Remove className prop from Logo component if it doesn't accept it */}
        <Logo />
        <div className={`bg-white shadow-lg rounded-lg ${getCardPadding()} mt-2 sm:mt-4`}>
          <h2 className={`${getTitleSize()} font-bold text-center text-gray-800 mb-3 sm:mb-4 md:mb-6`}>
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

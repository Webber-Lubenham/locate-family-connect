
import React, { useState } from 'react';
import Logo from './Logo';
import AuthTabs from './AuthTabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthScreen = 'login' | 'register' | 'forgotPassword';

const AuthContainer: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [userType, setUserType] = useState<'student' | 'parent'>('student');
  
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
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Logo />
        <div className="auth-card">
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

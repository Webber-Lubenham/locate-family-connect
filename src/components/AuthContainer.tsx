
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { UserType } from '@/lib/auth-redirects';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";

interface AuthContainerProps {
  initialScreen?: 'login' | 'register' | 'forgot-password';
  userType?: UserType;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ 
  initialScreen = 'login',
  userType = 'student'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot-password'>(initialScreen);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(userType);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'register' | 'forgot-password');
  };
  
  const handleRegisterClick = () => {
    setActiveTab('register');
  };
  
  const handleLoginClick = () => {
    setActiveTab('login');
  };
  
  const handleForgotPasswordClick = () => {
    setActiveTab('forgot-password');
  };
  
  // Get common props for forms
  const getCommonProps = () => ({
    userType: selectedUserType,
    onLoginClick: handleLoginClick,
    onRegisterClick: handleRegisterClick,
    onForgotPasswordClick: handleForgotPasswordClick,
  });

  return (
    <Card className="w-full max-w-md">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Registro</TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6">
          <TabsContent value="login" className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Bem-vindo de volta</h2>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${selectedUserType === 'student' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                onClick={() => setSelectedUserType('student')}
              >
                Estudante
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${selectedUserType === 'parent' || selectedUserType === 'guardian' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                onClick={() => setSelectedUserType('guardian')}
              >
                Responsável
              </button>
            </div>
            <LoginForm 
              {...getCommonProps()}
              variant="login"
            />
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Crie sua conta</h2>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${selectedUserType === 'student' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                onClick={() => setSelectedUserType('student')}
              >
                Estudante
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${selectedUserType === 'parent' || selectedUserType === 'guardian' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                onClick={() => setSelectedUserType('guardian')}
              >
                Responsável
              </button>
            </div>
            <RegisterForm 
              {...getCommonProps()}
            />
          </TabsContent>
          
          <TabsContent value="forgot-password" className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Recuperação de senha</h2>
            <ForgotPasswordForm onBackToLogin={handleLoginClick} userType={selectedUserType} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default AuthContainer;

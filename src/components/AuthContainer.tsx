
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeySquare, Map, Users } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AuthTabs from './AuthTabs';

interface AuthContainerProps {
  initialScreen?: 'menu' | 'login' | 'register';
}

const AuthContainer: React.FC<AuthContainerProps> = ({ initialScreen = 'menu' }) => {
  // Add state to track active view - 'menu', 'student-login', 'parent-login', 'student-register', 'parent-register'
  const [activeView, setActiveView] = useState<
    'menu' | 'student-login' | 'parent-login' | 'student-register' | 'parent-register'
  >(() => {
    if (initialScreen === 'login') return 'student-login';
    if (initialScreen === 'register') return 'student-register';
    return 'menu';
  });
  
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>(
    activeView.includes('student') ? 'student' : 'parent'
  );

  // Função para determinar se está em modo de login ou registro
  const isLoginMode = activeView.includes('login');
  const isRegisterMode = activeView.includes('register');

  // Function to handle going back to the main menu
  const handleBackToMenu = () => {
    setActiveView('menu');
  };

  // Função para alternar entre login e registro
  const handleSwitchMode = () => {
    if (isLoginMode) {
      setActiveView(activeTab === 'student' ? 'student-register' : 'parent-register');
    } else {
      setActiveView(activeTab === 'student' ? 'student-login' : 'parent-login');
    }
  };

  // Function to handle forgot password click
  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">EduConnect</CardTitle>
          <CardDescription>Sistema de Localização de Alunos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Menu View */}
          {activeView === 'menu' && (
            <div className="grid grid-cols-1 gap-4">
              <Button 
                className="flex justify-start items-center gap-2 h-12"
                onClick={() => setActiveView('student-login')}
              >
                <KeySquare className="h-5 w-5" />
                <span>Login</span>
              </Button>
              <Button 
                className="flex justify-start items-center gap-2 h-12"
                variant="outline"
                onClick={() => setActiveView('student-register')}
              >
                <Users className="h-5 w-5" />
                <span>Cadastro</span>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="flex justify-start items-center gap-2 h-12"
              >
                <Link to="/test-users">
                  <Users className="h-5 w-5" />
                  <span>Criar Usuários de Teste</span>
                </Link>
              </Button>
            </div>
          )}

          {/* Login ou Register Views */}
          {(isLoginMode || isRegisterMode) && (
            <>
              <AuthTabs 
                activeTab={activeTab} 
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  
                  if (isLoginMode) {
                    setActiveView(tab === 'student' ? 'student-login' : 'parent-login');
                  } else {
                    setActiveView(tab === 'student' ? 'student-register' : 'parent-register');
                  }
                }}
              />
              
              {isLoginMode && (
                <LoginForm
                  userType={activeTab}
                  onRegisterClick={handleSwitchMode}
                  onForgotPasswordClick={handleForgotPassword}
                />
              )}
              
              {isRegisterMode && (
                <RegisterForm
                  userType={activeTab}
                  onLoginClick={handleSwitchMode}
                />
              )}
              
              <Button
                variant="ghost"
                className="mt-4 w-full"
                onClick={handleBackToMenu}
              >
                Voltar ao menu
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>© 2025 EduConnect - Todos os direitos reservados</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthContainer;

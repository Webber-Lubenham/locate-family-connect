
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeySquare, Map, Users } from 'lucide-react';
import LoginForm from './LoginForm';
import AuthTabs from './AuthTabs';

interface AuthContainerProps {
  initialScreen?: string;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ initialScreen }) => {
  // Add state to track active view - can be 'menu', 'student-login', or 'parent-login'
  const [activeView, setActiveView] = useState<'menu' | 'student-login' | 'parent-login'>(
    initialScreen === 'login' ? 'student-login' : 'menu'
  );
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');

  // Function to handle going back to the main menu
  const handleBackToMenu = () => {
    setActiveView('menu');
  };

  // Function to handle forgot password click
  const handleForgotPassword = () => {
    // This would navigate to the forgot password flow
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
              <Button asChild className="flex justify-start items-center gap-2 h-12">
                <Link to="/login">
                  <KeySquare className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex justify-start items-center gap-2 h-12">
                <Link to="/test-users">
                  <Users className="h-5 w-5" />
                  <span>Criar Usuários de Teste</span>
                </Link>
              </Button>
            </div>
          )}

          {/* Login Views */}
          {(activeView === 'student-login' || activeView === 'parent-login') && (
            <>
              <AuthTabs 
                activeTab={activeTab} 
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setActiveView(tab === 'student' ? 'student-login' : 'parent-login');
                }}
              />
              <LoginForm
                userType={activeView === 'student-login' ? 'student' : 'parent'}
                onRegisterClick={() => console.log('Register clicked')}
                onForgotPasswordClick={handleForgotPassword}
              />
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

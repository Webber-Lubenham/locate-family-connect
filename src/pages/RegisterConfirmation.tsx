
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const RegisterConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastro Concluído</CardTitle>
          <CardDescription>
            Seu cadastro foi realizado com sucesso! Em breve você receberá um email de confirmação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Verifique seu email e clique no link de confirmação para ativar sua conta.
              </p>
              <Button onClick={handleLogin} className="w-full">
                Fazer Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterConfirmation;

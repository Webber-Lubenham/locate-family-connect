
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeySquare, Map, Users } from 'lucide-react';

const AuthContainer = () => {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">EduConnect</CardTitle>
          <CardDescription>Sistema de Localização de Alunos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>© 2025 EduConnect - Todos os direitos reservados</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthContainer;

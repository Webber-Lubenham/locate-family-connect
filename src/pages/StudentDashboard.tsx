import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

const StudentDashboard: React.FC = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Bem-vindo(a), {user.full_name}</CardTitle>
          <CardDescription>
            Seu painel de controle como estudante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Telefone:</strong> {user.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Ações</h3>
              <div className="space-y-4">
                <Button onClick={() => navigate('/profile')}>
                  Editar Perfil
                </Button>
                <Button variant="outline" onClick={() => navigate('/student-map')}>
                  Ver Mapa de Alunos
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;

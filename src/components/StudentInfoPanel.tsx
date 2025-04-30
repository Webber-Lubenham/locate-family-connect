
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

interface StudentInfoPanelProps {
  userFullName: string;
  email: string | null;
  phone: string;
}

const StudentInfoPanel: React.FC<StudentInfoPanelProps> = ({ 
  userFullName, 
  email, 
  phone 
}) => {
  const navigate = useNavigate();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Bem-vindo(a), {userFullName}</CardTitle>
          <CardDescription>
            Seu painel de controle como estudante
          </CardDescription>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Perfil
          </Button>
          <LogoutButton variant="destructive" className="h-10 px-4 py-2">
            Sair
          </LogoutButton>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {userFullName}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Telefone:</strong> {phone}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Ações</h3>
            <div className="space-y-4">
              <Button 
                variant="default" 
                className="w-full flex items-center justify-center"
                onClick={() => navigate('/guardians')}
              >
                <Users className="mr-2 h-5 w-5" />
                Gerenciar Responsáveis
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoPanel;

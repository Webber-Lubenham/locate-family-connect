
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '@/contexts/UnifiedAuthContext';

const ProfilePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">
          Visualize seus dados de perfil
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Este é um componente de perfil simplificado.</p>
          <p className="mt-2">Você está logado como: {user?.email}</p>
          
          <div className="mt-4">
            <Button onClick={() => navigate('/dashboard')}>
              Ir para o Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;

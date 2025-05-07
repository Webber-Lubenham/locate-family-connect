
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '@/contexts/UnifiedAuthContext';

const ProfilePage = () => {
  const { user, userProfile } = useUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Perfil</h1>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome</h3>
              <p className="mt-1">{user?.full_name || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{user?.email || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo de usuário</h3>
              <p className="mt-1">
                {user?.user_type === 'student' ? 'Estudante' : 
                 user?.user_type === 'parent' ? 'Responsável' : 
                 user?.user_type || 'Não informado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;

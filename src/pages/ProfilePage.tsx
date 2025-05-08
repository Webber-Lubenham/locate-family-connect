
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import type { ExtendedUser } from '@/contexts/UnifiedAuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const extendedUser = user as ExtendedUser;
  const navigate = useNavigate();
  
  // Determine the appropriate dashboard route based on user type
  const getDashboardRoute = () => {
    const userType = extendedUser?.user_type;
    
    if (!userType) {
      // If user type is not available, show error message
      toast({
        title: 'Erro',
        description: 'Tipo de usuário não encontrado',
        variant: 'destructive'
      });
      return '/';
    }
    
    if (userType === 'student') {
      return '/student/dashboard';
    } else if (userType === 'parent' || userType === 'guardian') {
      return '/guardian/dashboard';
    } else if (userType === 'admin') {
      return '/admin/webhook';
    } else if (userType === 'developer') {
      return '/developer/flow';
    }
    
    // Default fallback - redirect to profile page
    return '/profile';
  };
  
  // Handle button click
  const handleBackClick = () => {
    navigate(getDashboardRoute());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Perfil</h1>
        <Button 
          variant="outline" 
          onClick={handleBackClick}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome</h3>
              <p className="mt-1">{extendedUser?.full_name || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{extendedUser?.email || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo de usuário</h3>
              <p className="mt-1">
                {extendedUser?.user_type === 'student' ? 'Estudante' : 
                 extendedUser?.user_type === 'parent' ? 'Responsável' : 
                 extendedUser?.user_type || 'Não informado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;

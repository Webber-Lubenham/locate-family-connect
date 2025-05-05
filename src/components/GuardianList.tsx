
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from '@/contexts/UnifiedAuthContext';
import { useNavigate } from 'react-router-dom';
import { useGuardianList } from '@/hooks/guardian/useGuardianList';
import GuardianCard from './guardian/GuardianCard';
import { EmptyState, LoadingState } from './guardian/GuardianListStates';
import { Guardian } from '@/hooks/guardian/types';

const GuardianList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    guardians, 
    isLoading, 
    error, 
    fetchGuardians, 
    deleteGuardian, 
    shareLocation, 
    resendEmail
  } = useGuardianList();
  
  const { user } = useUser();
  const navigate = useNavigate();

  // Verifica se o usuário está autenticado
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            Você precisa estar autenticado para acessar esta página.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/login")}>Ir para Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Meus Responsáveis</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Responsável
        </Button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Adicionar Responsável</h3>
            {/* Componente de formulário para adicionar responsável */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button>Adicionar</Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LoadingState />
        </div>
      ) : guardians.length === 0 ? (
        <EmptyState onAddClick={() => setIsDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guardians.map((guardian: Guardian) => (
            <GuardianCard
              key={guardian.id}
              id={guardian.id}
              name={guardian.full_name || 'Responsável'}
              email={guardian.email}
              phone={guardian.phone || ''}
              isActive={guardian.is_active || true}
              createdAt={guardian.created_at}
              onRemove={deleteGuardian}
              onSendInvite={(email, name) => 
                name ? shareLocation(guardian.id, email, name) : 
                shareLocation(guardian.id, email, 'Responsável')
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GuardianList;

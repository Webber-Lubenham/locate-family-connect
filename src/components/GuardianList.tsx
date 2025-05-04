
import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from '@/contexts/UnifiedAuthContext';
import { useNavigate } from 'react-router-dom';
import { useGuardianList } from '@/hooks/useGuardianList';
import GuardianCard from './guardian/GuardianCard';
import AddGuardianDialog from './guardian/AddGuardianDialog';
import { EmptyState, LoadingState } from './guardian/GuardianListStates';

const GuardianList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    guardians, 
    isLoading, 
    error, 
    sharingStatus,
    fetchGuardians, 
    deleteGuardian, 
    shareLocation, 
    resendEmail,
    formatRelativeTime
  } = useGuardianList();
  
  const { user } = useUser();
  const navigate = useNavigate();

  // Verifica se o usuário está autenticado
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
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
          <AlertCircle className="h-4 w-4" />
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

      <AddGuardianDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onGuardianAdded={fetchGuardians}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LoadingState />
        </div>
      ) : guardians.length === 0 ? (
        <EmptyState onAddClick={() => setIsDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guardians.map((guardian) => (
            <GuardianCard
              key={guardian.id}
              id={guardian.id}
              fullName={guardian.full_name}
              email={guardian.email}
              phone={guardian.phone || undefined}
              createdAt={guardian.created_at}
              isActive={true}
              sharingStatus={sharingStatus[guardian.id]}
              formatRelativeTime={formatRelativeTime}
              onShareLocation={() => shareLocation(guardian.id, guardian.email, guardian.full_name)}
              onResendEmail={() => resendEmail(guardian.id, guardian.email, guardian.full_name)}
              onDelete={() => deleteGuardian(guardian.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GuardianList;

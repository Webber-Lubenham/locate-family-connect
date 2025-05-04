
import React from "react";
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useGuardiansPage } from "@/hooks/useGuardiansPage";
import GuardianList from "@/components/guardian/GuardianList";
import AddGuardianForm from "@/components/guardian/AddGuardianForm";

const GuardiansPage = () => {
  const navigate = useNavigate();
  const {
    user,
    guardians,
    loading,
    error,
    showAddGuardian,
    setShowAddGuardian,
    addGuardian,
    removeGuardian,
    sendInviteEmail,
  } = useGuardiansPage();

  // Navigate back to the dashboard
  const goBackToDashboard = () => {
    const userType = user?.user_metadata?.user_type || 'student';
    if (userType === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  // Check if the user is authenticated
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
    <div className="container mx-auto py-6">
      {/* Back button */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goBackToDashboard} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Responsáveis</h1>
          <p className="text-muted-foreground">
            Gerencie as pessoas responsáveis que podem acompanhar sua localização
          </p>
        </div>
        <Button onClick={() => setShowAddGuardian(true)}>
          Adicionar Responsável
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GuardianList
        guardians={guardians}
        loading={loading}
        onAddClick={() => setShowAddGuardian(true)}
        onRemoveGuardian={removeGuardian}
        onSendInvite={sendInviteEmail}
      />

      {/* Modal for adding guardian */}
      <Dialog open={showAddGuardian} onOpenChange={setShowAddGuardian}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Responsável</DialogTitle>
            <DialogDescription>
              Adicione uma pessoa responsável para acompanhar sua localização.
            </DialogDescription>
          </DialogHeader>
          
          <AddGuardianForm onSubmit={addGuardian} />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGuardian(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuardiansPage;

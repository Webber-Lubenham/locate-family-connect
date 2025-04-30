
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Plus, Trash2 } from 'lucide-react';
import { GuardianData } from '@/types/database';

interface GuardianManagerProps {
  guardians: GuardianData[];
  isLoading: boolean;
  error: string | null;
  onAddGuardian: (guardian: Partial<GuardianData>) => Promise<void>;
  onDeleteGuardian: (id: string) => Promise<void>;
  onShareLocation: (guardian: GuardianData) => Promise<void>;
  sharingStatus: Record<string, string>;
}

const GuardianManager: React.FC<GuardianManagerProps> = ({
  guardians,
  isLoading,
  error,
  onAddGuardian,
  onDeleteGuardian,
  onShareLocation,
  sharingStatus
}) => {
  const [newGuardian, setNewGuardian] = useState({ full_name: '', email: '', phone: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddGuardian = async () => {
    await onAddGuardian(newGuardian);
    setNewGuardian({ full_name: '', email: '', phone: '' });
    setIsDialogOpen(false);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Meus Responsáveis</h2>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Adicionar Responsável</Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : guardians.length === 0 ? (
        <div className="text-muted-foreground">Nenhum responsável cadastrado.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guardians.map((guardian) => (
            <Card key={guardian.id}>
              <CardHeader>
                <CardTitle>{guardian.full_name || 'Responsável'}</CardTitle>
                <CardDescription>{guardian.email}</CardDescription>
              </CardHeader>
              <CardContent>
                {guardian.phone && <p className="text-sm text-muted-foreground">Telefone: {guardian.phone}</p>}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onShareLocation(guardian)} disabled={sharingStatus[guardian.id] === 'loading'}>
                  {sharingStatus[guardian.id] === 'loading' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                  Enviar Localização
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDeleteGuardian(guardian.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remover
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para adicionar responsável */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Responsável</DialogTitle>
            <DialogDescription>Adicione uma pessoa responsável para acompanhar sua localização.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Responsável *</Label>
              <Input id="email" type="email" placeholder="email@exemplo.com" value={newGuardian.email} onChange={e => setNewGuardian(g => ({ ...g, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Responsável</Label>
              <Input id="name" placeholder="Nome completo" value={newGuardian.full_name} onChange={e => setNewGuardian(g => ({ ...g, full_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone do Responsável</Label>
              <Input id="phone" placeholder="+XX (XX) XXXXX-XXXX" value={newGuardian.phone} onChange={e => setNewGuardian(g => ({ ...g, phone: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddGuardian}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuardianManager;

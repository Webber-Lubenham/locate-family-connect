
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from 'lucide-react';

interface GuardianCardProps {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  onRemove: (id: string) => Promise<void>;
  onSendInvite: (email: string, name: string | null) => Promise<void>;
}

const GuardianCard: React.FC<GuardianCardProps> = ({
  id,
  name,
  email,
  phone,
  isActive,
  createdAt,
  onRemove,
  onSendInvite
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name || "Responsável"}</CardTitle>
        <CardDescription className="flex items-center">
          {email}
          {isActive ? (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
              Ativo
            </span>
          ) : (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
              Pendente
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {phone && (
            <p>Telefone: {phone}</p>
          )}
          <p>Adicionado em: {new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onSendInvite(email, name)}
        >
          <Mail className="mr-2 h-4 w-4" /> Convidar
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Remover
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GuardianCard;

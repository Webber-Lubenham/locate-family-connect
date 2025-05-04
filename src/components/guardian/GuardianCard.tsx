
import React from 'react';
import { Trash2, AlertCircle, CheckCircle, Mail, MapPin, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareStatusData } from '@/hooks/useGuardianList';

interface GuardianCardProps {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
  sharingStatus: ShareStatusData | undefined;
  formatRelativeTime: (timestamp: number) => string;
  onShareLocation: () => void;
  onResendEmail: () => void;
  onDelete: () => void;
}

const GuardianCard: React.FC<GuardianCardProps> = ({
  id,
  fullName,
  email,
  phone,
  createdAt,
  isActive,
  sharingStatus,
  formatRelativeTime,
  onShareLocation,
  onResendEmail,
  onDelete
}) => {
  return (
    <Card key={id}>
      <CardHeader>
        <CardTitle>{fullName || "Responsável"}</CardTitle>
        <CardDescription className="flex items-center">
          {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {phone && (
            <p>Telefone: {phone}</p>
          )}
          {sharingStatus?.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              {sharingStatus?.status === 'success' ? (
                <>
                  <CheckCircle className="h-3 w-3 inline-block mr-1 text-green-500" />
                  Email enviado {formatRelativeTime(sharingStatus.timestamp)}
                </>
              ) : sharingStatus?.status === 'error' ? (
                <>
                  <AlertCircle className="h-3 w-3 inline-block mr-1 text-red-500" />
                  Falha ao enviar email {formatRelativeTime(sharingStatus.timestamp)}
                </>
              ) : null}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {sharingStatus?.status === 'success' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResendEmail}
            className="min-w-[140px]"
          >
            <Mail className="h-4 w-4 mr-2" />
            Reenviar Email
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onShareLocation}
            disabled={sharingStatus?.status === 'sharing'}
            className="min-w-[140px]"
          >
            {sharingStatus?.status === 'sharing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : sharingStatus?.status === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                Tentar Novamente
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Enviar Localização
              </>
            )}
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GuardianCard;

import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SharedLocationAlertProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  message: string;
  details?: string;
}

export const SharedLocationAlert: React.FC<SharedLocationAlertProps> = ({
  isOpen,
  onClose,
  success,
  message,
  details
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[90vw] md:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {success ? '✅ Localização Compartilhada' : '❌ Erro no Compartilhamento'}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
          {details && (
            <p className="text-sm text-muted-foreground mt-2">{details}</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

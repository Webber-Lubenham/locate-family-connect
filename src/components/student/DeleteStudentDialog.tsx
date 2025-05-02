
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Student } from '@/types/auth';

interface DeleteStudentDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
}

const DeleteStudentDialog: React.FC<DeleteStudentDialogProps> = ({
  student,
  open,
  onOpenChange,
  onDelete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.client.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Remove guardian relationship
      const { error } = await supabase.client
        .from('guardians')
        .delete()
        .eq('student_id', student.id)
        .eq('guardian_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Estudante removido",
        description: `${student.name} foi desvinculado da sua conta.`,
      });

      onOpenChange(false);
      if (onDelete) onDelete();
    } catch (error: any) {
      console.error('Erro ao remover estudante:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o estudante."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Estudante</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja remover {student.name} da sua lista de estudantes?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              "Sim, remover"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteStudentDialog;

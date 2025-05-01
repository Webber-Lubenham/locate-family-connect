import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { studentService } from '@/lib/services/studentService';

interface Student {
  student_id: string;
  status: string;
  user_profiles: {
    name: string;
    email: string;
  };
}

interface DeleteStudentDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteStudentDialog({
  student,
  isOpen,
  onClose,
  onSuccess,
}: DeleteStudentDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!student) return;

    setLoading(true);
    try {
      await studentService.deleteStudent(student.student_id);

      toast({
        title: 'Sucesso',
        description: 'Estudante removido com sucesso.',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível remover o estudante.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover Estudante</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover {student?.user_profiles.name}? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
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
  onDelete
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!student?.id) return;

    setLoading(true);
    try {
      // First remove the guardian-student relationship
      const { error: guardianError } = await supabase
        .from('guardians')
        .delete()
        .eq('student_id', student.id);

      if (guardianError) {
        console.error('Error deleting guardian relationship:', guardianError);
        throw guardianError;
      }
      
      // Use the string ID safely
      const studentId = String(student.id);

      toast({
        title: "Vínculo removido",
        description: `O estudante ${student.name} foi removido com sucesso.`,
      });

      if (onDelete) onDelete();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível remover o estudante."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover estudante</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover o vínculo com o estudante <strong>{student?.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              'Remover'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStudentDialog;

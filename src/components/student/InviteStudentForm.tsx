import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { studentService } from '@/lib/services/studentService';
import { useToast } from '../ui/use-toast';

const inviteFormSchema = z.object({
  studentEmail: z.string().email('Email inválido'),
  studentName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface InviteStudentFormProps {
  onSuccess?: () => void;
}

export function InviteStudentForm({ onSuccess }: InviteStudentFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const user = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema)
  });

  const onSubmit = async (data: InviteFormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar um estudante",
        variant: "destructive"
      });
      return;
    }
    
    setStatus('loading');
    try {
      const result = await studentService.addStudent({
        studentEmail: data.studentEmail,
        studentName: data.studentName,
        parentId: user.id
      });

      setStatus('success');
      toast({
        title: "Sucesso!",
        description: result.message
      });
      reset();
      onSuccess?.();
    } catch (error: any) {
      setStatus('error');
      toast({
        title: "Erro",
        description: error.message || 'Erro ao adicionar estudante',
        variant: "destructive"
      });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="studentEmail">Email do Estudante</Label>
        <Input
          id="studentEmail"
          type="email"
          {...register('studentEmail')}
          placeholder="email@exemplo.com"
        />
        {errors.studentEmail && (
          <p className="text-sm text-red-500">{errors.studentEmail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentName">Nome do Estudante</Label>
        <Input
          id="studentName"
          {...register('studentName')}
          placeholder="Nome completo"
        />
        {errors.studentName && (
          <p className="text-sm text-red-500">{errors.studentName.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adicionando estudante...
          </>
        ) : (
          'Adicionar Estudante'
        )}
      </Button>
    </form>
  );
} 
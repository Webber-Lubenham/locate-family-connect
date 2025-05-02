
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

interface InviteStudentFormProps {
  onStudentAdded?: () => void;
}

export function InviteStudentForm({ onStudentAdded }: InviteStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    name: z.string().min(1, { message: "Nome é obrigatório" })
  });

  type FormData = z.infer<typeof formSchema>;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Verificar se o estudante já existe
      const { data: existingUser, error: userError } = await supabase.client
        .from('profiles')
        .select('id, user_id')
        .eq('email', data.email.toLowerCase())
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 é "não encontrado", que é um resultado esperado
        throw userError;
      }

      if (!existingUser) {
        setError('Estudante não encontrado. O estudante precisa estar cadastrado no sistema.');
        return;
      }

      // Obter o ID do responsável atual
      const { data: { user } } = await supabase.client.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Adicionar relação entre responsável e estudante
      const { error: relationError } = await supabase.client.rpc(
        'add_guardian_relationship',
        {
          p_student_id: existingUser.user_id || existingUser.id,
          p_guardian_email: user.email || '',
          p_guardian_name: user.user_metadata?.full_name || 'Responsável'
        }
      );

      if (relationError) {
        if (relationError.message.includes('duplicate')) {
          setError('Este estudante já está vinculado à sua conta');
          return;
        }
        throw relationError;
      }

      // Sucesso
      setSuccess(true);
      toast({
        title: "Estudante adicionado",
        description: `${data.name} foi vinculado à sua conta com sucesso!`,
      });

      reset();
      if (onStudentAdded) {
        onStudentAdded();
      }

    } catch (err: any) {
      console.error('Erro ao adicionar estudante:', err);
      setError(err.message || 'Ocorreu um erro ao adicionar o estudante');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o estudante."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>Estudante adicionado com sucesso!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email do Estudante</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
        <p className="text-xs text-gray-500">
          *O estudante precisa estar cadastrado no sistema
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Estudante</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Nome completo"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adicionando...
          </>
        ) : "Adicionar Estudante"}
      </Button>
    </form>
  );
}

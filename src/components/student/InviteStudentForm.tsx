
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

// Define the schema for form validation
const formSchema = z.object({
  email: z.string().email({
    message: "Por favor insira um email válido.",
  }),
  name: z.string().min(1, {
    message: "O nome é obrigatório.",
  }),
});

// Define the form values type explicitly to match the schema
type FormValues = {
  email: string;
  name: string;
};

export function InviteStudentForm({ onStudentAdded }: InviteStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Check if student already exists
      const { data: existingStudents, error: checkError } = await supabase
        .from('profiles')
        .select('id, user_id, email')
        .eq('email', data.email);

      if (checkError) throw checkError;

      let studentId = '';

      if (existingStudents && existingStudents.length > 0) {
        // Student exists, get their ID
        studentId = existingStudents[0].user_id || String(existingStudents[0].id);

        // Check if relationship already exists
        const { data: existingRelation, error: relationError } = await supabase
          .from('guardians')
          .select('id')
          .eq('student_id', studentId)
          .eq('guardian_id', user.id);

        if (relationError) throw relationError;

        if (existingRelation && existingRelation.length > 0) {
          toast({
            title: "Aviso",
            description: "Este estudante já está vinculado à sua conta.",
          });
          form.reset();
          setIsLoading(false);
          return;
        }
      } else {
        // Student doesn't exist, inform user
        toast({
          title: "Estudante não encontrado",
          description: "Este email não está registrado como estudante. Por favor, peça ao estudante que se cadastre primeiro.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Create relationship
      const { error: addError } = await supabase
        .from('guardians')
        .insert({
          student_id: studentId,
          guardian_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "Responsável",
          is_active: true
        });

      if (addError) throw addError;

      setSuccess(true);
      form.reset();
      toast({
        title: "Estudante adicionado",
        description: `${data.name} foi vinculado à sua conta com sucesso.`,
      });

      if (onStudentAdded) {
        onStudentAdded();
      }
    } catch (error: any) {
      console.error("Erro ao adicionar estudante:", error);
      setError(error.message || "Não foi possível adicionar o estudante.");
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o estudante.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Estudante adicionado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email do Estudante</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          {...form.register("email")}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Estudante</Label>
        <Input
          id="name"
          placeholder="Nome Completo"
          {...form.register("name")}
          disabled={isLoading}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adicionando...
          </>
        ) : (
          "Adicionar Estudante"
        )}
      </Button>
    </form>
  );
}

export default InviteStudentForm;

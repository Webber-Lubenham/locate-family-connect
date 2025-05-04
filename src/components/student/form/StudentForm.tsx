
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { StudentFormProps, StudentFormValues, studentFormSchema } from '../types/student-form.types';

interface StudentFormComponentProps extends StudentFormProps {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  onSubmit: (data: StudentFormValues) => void;
}

export function StudentForm({
  isLoading,
  error,
  success,
  onSubmit
}: StudentFormComponentProps) {
  // Configure the form with proper types from schema
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

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

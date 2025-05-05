
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { InviteStudentResult } from '@/types/auth';
import useInviteStudent from '../student/hooks/useInviteStudent';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Nome deve ter pelo menos 3 caracteres',
  }),
  email: z.string().email({
    message: 'Email inválido',
  }),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function InviteStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { loading, handleInviteStudent } = useInviteStudent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await handleInviteStudent(
        data.email,
        data.name,
        data.phone
      );
      
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Convite enviado com sucesso!',
        });
        form.reset();
        onStudentAdded();
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao enviar convite',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar estudante:', error);
      toast({
        title: 'Erro',
        description: 'Houve um erro ao adicionar o estudante',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do estudante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading || isSubmitting} className="w-full">
          {loading || isSubmitting ? 'Enviando...' : 'Adicionar Estudante'}
        </Button>
      </form>
    </Form>
  );
}

export default InviteStudentForm;

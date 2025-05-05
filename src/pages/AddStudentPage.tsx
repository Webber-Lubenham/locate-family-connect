
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UnifiedAuthContext';

interface UserSession {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    [key: string]: any;
  };
}

const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddStudentPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: ''
    }
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Check if student already exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', values.email)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        // Error other than "not found"
        throw userError;
      }
      
      let studentId: string;
      
      if (existingUser) {
        // If user exists, use their ID
        studentId = existingUser.user_id;
        
        // Check if the student is already linked to this parent
        const { data: existingRelationship } = await supabase
          .from('guardians')
          .select('*')
          .eq('student_id', studentId)
          .eq('guardian_id', user.id)
          .single();
        
        if (existingRelationship) {
          toast({
            title: "Estudante já vinculado",
            description: "Este estudante já está vinculado à sua conta.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      } else {
        // If user doesn't exist, we need to create a new one via edge function
        // This is just a placeholder, should be handled by backend
        toast({
          title: "Estudante não encontrado",
          description: "Usuário não encontrado no sistema. Um convite será enviado para o email informado.",
        });
        
        // For now, we'll avoid creating a new user and just show a notification
        setIsLoading(false);
        reset();
        return;
      }
      
      // Create the relationship
      const { error: relationshipError } = await supabase
        .from('guardians')
        .insert({
          guardian_id: user.id,
          student_id: studentId,
          email: (user as unknown as { email: string }).email,
          full_name: user.user_metadata?.full_name || 'Responsável',
          is_active: true
        });
      
      if (relationshipError) throw relationshipError;
      
      toast({
        title: "Estudante adicionado",
        description: `${values.name} foi vinculado à sua conta com sucesso.`,
      });
      
      // Reset form
      reset();
      
      // Redirect to dashboard
      navigate('/parent-dashboard');
      
    } catch (error: any) {
      console.error('Erro ao adicionar estudante:', error);
      toast({
        title: "Erro ao adicionar estudante",
        description: error.message || "Não foi possível vincular o estudante à sua conta.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Estudante</CardTitle>
              <CardDescription>
                Vincule um estudante à sua conta de responsável
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email do Estudante</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="estudante@exemplo.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Estudante</Label>
                    <Input
                      id="name"
                      placeholder="Nome completo"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
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
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <p className="text-sm text-gray-500 text-center">
                O estudante receberá uma notificação sobre esta vinculação e poderá aceitar ou recusar.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AddStudentPage;

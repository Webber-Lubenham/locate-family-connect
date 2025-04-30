
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { z } from 'zod';

// Schema para validação dos dados do formulário
const studentSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
});

type FormData = z.infer<typeof studentSchema>;

const AddStudentPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    full_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Garantir que apenas pais/responsáveis possam acessar esta página
  useEffect(() => {
    if (user && user.user_type !== 'parent') {
      toast({
        title: "Acesso Negado",
        description: "Apenas responsáveis podem adicionar estudantes",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  // Lidar com mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro específico ao editar o campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulário
  const validateForm = () => {
    try {
      studentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            newErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Verificar se o estudante já existe
  const checkStudentExists = async (email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('user_type', 'student')
      .single();

    if (error && error.code !== 'PGSQL_NO_ROWS_RETURNED') {
      console.error('Erro ao verificar estudante:', error);
      return { exists: false, error };
    }

    return { exists: !!data, studentData: data };
  };

  // Vincular responsável ao estudante
  const linkGuardianToStudent = async (studentId: string) => {
    if (!user?.email) return { error: { message: 'Email do responsável não encontrado' } };

    // Note: student_id is a string (UUID)
    const guardianData = {
      student_id: studentId,
      email: user.email,
      full_name: user.full_name || '',
      is_active: true
    };

    const { data, error } = await supabase
      .from('guardians')
      .insert([guardianData]);

    return { data, error };
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Verificar se o estudante já existe
      const { exists, studentData, error: checkError } = await checkStudentExists(formData.email);
      
      if (checkError) {
        toast({
          title: "Erro",
          description: `Não foi possível verificar o estudante: ${checkError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      if (!exists) {
        toast({
          title: "Estudante não encontrado",
          description: "Este email não está registrado como estudante no sistema",
          variant: "destructive",
        });
        return;
      }
      
      // Se o estudante existe, vincular ao responsável
      const { error: linkError } = await linkGuardianToStudent(studentData.id);
      
      if (linkError) {
        // Verificar se é um erro de duplicação
        if (linkError.hasOwnProperty('code') && (linkError as any).code === '23505') { // Código de violação de unicidade do PostgreSQL
          toast({
            title: "Vínculo já existe",
            description: "Você já está vinculado a este estudante",
            variant: "default",
          });
        } else {
          toast({
            title: "Erro",
            description: `Não foi possível vincular ao estudante: ${linkError.message}`,
            variant: "destructive",
          });
        }
        return;
      }
      
      // Sucesso
      toast({
        title: "Estudante adicionado",
        description: `${formData.full_name} foi vinculado à sua conta com sucesso`,
      });
      
      // Limpar formulário
      setFormData({
        email: '',
        full_name: '',
      });
      
      // Redirecionar para o dashboard
      setTimeout(() => {
        navigate('/parent-dashboard');
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao adicionar estudante:', err);
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao adicionar o estudante",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Adicionar Estudante</h1>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Vincular Estudante</CardTitle>
          <CardDescription>
            Adicione um estudante para acompanhar sua localização
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Estudante</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                placeholder="estudante@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
              <p className="text-sm text-gray-500">
                O estudante deve já estar cadastrado no sistema
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome do Estudante</Label>
              <Input 
                id="full_name"
                name="full_name"
                placeholder="Nome completo do estudante"
                value={formData.full_name}
                onChange={handleChange}
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.full_name}
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/parent-dashboard')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Adicionar Estudante
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddStudentPage;

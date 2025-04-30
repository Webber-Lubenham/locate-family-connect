
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationData } from '@/types/database';

// Função para verificar se o email já está cadastrado
async function checkUserExists(email: string): Promise<boolean> {
  const { data, error } = await supabase.client
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
  
  return !!data;
}

// Função para obter o ID do usuário a partir do email
async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase.client
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .maybeSingle();
  
  if (error || !data) {
    console.error('Error getting user ID:', error);
    return null;
  }
  
  return data.user_id;
}

const AddStudentPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!user) {
      navigate('/login', { replace: true });
      toast({
        variant: "destructive",
        title: "Acesso restrito",
        description: "Você precisa estar logado para acessar esta página."
      });
    } else if (user.user_type !== 'parent') {
      navigate('/dashboard', { replace: true });
      toast({
        variant: "destructive",
        title: "Acesso restrito",
        description: "Apenas responsáveis podem adicionar estudantes."
      });
    }
  }, [user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !studentName) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Verificar se o estudante já existe
      const studentExists = await checkUserExists(email);
      if (!studentExists) {
        setError('Estudante não encontrado. Verifique o e-mail ou solicite que o estudante se cadastre primeiro.');
        setLoading(false);
        return;
      }

      // 2. Obter o ID do estudante
      const studentId = await getUserIdByEmail(email);
      if (!studentId) {
        setError('Não foi possível obter o ID do estudante');
        setLoading(false);
        return;
      }

      if (!user?.email) {
        setError('Informações do responsável não disponíveis');
        setLoading(false);
        return;
      }

      // 3. Adicionar o relacionamento entre responsável e estudante
      const { data, error: relationError } = await supabase.client.rpc(
        'add_guardian_relationship',
        {
          p_student_id: studentId,
          p_guardian_email: user.email,
          p_guardian_name: user.full_name || 'Responsável'
        }
      );

      if (relationError) {
        console.error('Error adding relationship:', relationError);
        if (relationError.message && relationError.message.includes('duplicate')) {
          setError('Este estudante já está vinculado à sua conta');
        } else {
          setError(`Erro ao vincular estudante: ${relationError.message}`);
        }
        setLoading(false);
        return;
      }

      // 4. Sucesso
      setSuccess(true);
      toast({
        title: "Estudante adicionado",
        description: `${studentName} foi vinculado à sua conta com sucesso!`
      });

      // 5. Redirecionar após um pequeno delay
      setTimeout(() => {
        navigate('/parent-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error adding student:', error);
      setError('Ocorreu um erro inesperado ao adicionar o estudante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Adicionar Estudante</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <div className="text-center p-4">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-green-600">Estudante adicionado com sucesso!</h2>
            <p className="mt-2 text-gray-600">Redirecionando para o painel...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Estudante</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  *O estudante precisa estar cadastrado no sistema
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentName">Nome do Estudante</Label>
                <Input
                  id="studentName"
                  placeholder="Nome completo"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                className="w-full" 
                type="submit" 
                disabled={loading || !email || !studentName}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : 'Adicionar Estudante'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default AddStudentPage;

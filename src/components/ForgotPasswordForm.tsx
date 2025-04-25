
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
const supabase = getSupabaseClient();

interface ForgotPasswordFormProps {
  userType: 'student' | 'parent';
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  userType,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Use the client property to access Supabase methods
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: "Link de recuperação enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o link de recuperação. Verifique o email e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!sent ? (
        <>
          <div className="space-y-2">
            <label htmlFor={`recovery${userType === 'student' ? 'Student' : 'Parent'}Email`} className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <Input
              id={`recovery${userType === 'student' ? 'Student' : 'Parent'}Email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail cadastrado"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="mb-4">Link de recuperação enviado para <strong>{email}</strong></p>
          <p className="text-sm text-gray-600 mb-4">
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </p>
          <Button onClick={() => setEmail('')} variant="outline" className="mt-2">
            Tentar com outro email
          </Button>
        </div>
      )}
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
        >
          Voltar para o login
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;

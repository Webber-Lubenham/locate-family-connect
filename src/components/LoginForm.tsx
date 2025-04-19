
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface LoginFormProps {
  userType: 'student' | 'parent';
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  userType,
  onRegisterClick,
  onForgotPasswordClick,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Use the client property to access Supabase methods
      const { data, error } = await supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo de volta!`,
      });
      
      // No need to redirect as the UserContext will handle that
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Ocorreu um erro ao realizar o login.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Por favor, verifique suas credenciais.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Por favor, verifique sua caixa de entrada.';
      }
      
      setError(errorMessage);
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={`${userType}Email`} className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <Input
          id={`${userType}Email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu.email@exemplo.com"
          required
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`${userType}Password`} className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <Input
          id={`${userType}Password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          required
          autoComplete="current-password"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
        >
          Esqueceu a senha?
        </button>
        
        <p className="mt-2 text-sm text-gray-600">
          Não tem uma conta?{' '}
          <button type="button" onClick={onRegisterClick} className="text-blue-600 hover:underline focus:outline-none">
            Cadastre-se
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;

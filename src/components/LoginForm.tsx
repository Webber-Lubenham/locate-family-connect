
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';

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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Aguarde...",
        description: "Verificando suas credenciais.",
      });

      // Attempt to sign in with Supabase
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(), // Convert to lowercase to match seed data
        password
      });

      if (error) {
        console.error('Sign-in error:', error);
        throw new Error(error.message || 'Erro ao fazer login');
      }

      // Check if user type matches
      const { data: userData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (profileError || !userData || userData.userType !== userType) {
        throw new Error('Tipo de usuário não corresponde');
      }

      // Successful login
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${userData.name}!`,
      });

      // Redirect to appropriate dashboard
      window.location.href = `/dashboard/${userType}`;
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Credenciais inválidas.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`${userType}Email`} className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <input
          id={`${userType}Email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="ana.clara.santos.test@sistemamonitore.com.br"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`${userType}Password`} className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          id={`${userType}Password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="123456"
          required
        />
      </div>
      
      <button type="submit" className="w-full py-2 px-4 rounded-md btn-primary">
        Entrar
      </button>
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="auth-link text-sm"
        >
          Esqueceu a senha?
        </button>
        
        <p className="mt-2 text-sm text-gray-600">
          Não tem uma conta?{' '}
          <button type="button" onClick={onRegisterClick} className="auth-link">
            Cadastre-se
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;

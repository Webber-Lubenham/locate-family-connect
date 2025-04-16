
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

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

  const handleSubmit = (e: React.FormEvent) => {
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

    // Here you would typically handle authentication
    toast({
      title: "Login enviado",
      description: `Tentativa de login como ${userType === 'student' ? 'estudante' : 'responsável'}.`,
    });

    // For demo purposes only
    console.log('Login attempt:', { userType, email, password });
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
          placeholder="seu.email@exemplo.com"
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
          placeholder="Digite sua senha"
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

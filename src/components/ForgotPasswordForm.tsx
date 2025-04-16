
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface ForgotPasswordFormProps {
  userType: 'student' | 'parent';
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  userType,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Link de recuperação enviado",
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
    });

    // For demo purposes only
    console.log('Password recovery:', { userType, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`recovery${userType === 'student' ? 'Student' : 'Parent'}Email`} className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <input
          id={`recovery${userType === 'student' ? 'Student' : 'Parent'}Email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="Digite seu e-mail cadastrado"
          required
        />
      </div>
      
      <button type="submit" className="w-full py-2 px-4 rounded-md btn-primary">
        Enviar link de recuperação
      </button>
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onBackToLogin}
          className="auth-link text-sm"
        >
          Voltar para o login
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;

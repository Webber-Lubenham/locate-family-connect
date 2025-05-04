import React, { useState, useEffect, FormEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User, Lock, Phone, School, Book, Mail, UserPlus, Plus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '@/lib/utils/email-validator';
import { UserType } from '@/lib/auth-redirects';

export interface RegisterFormProps {
  userType: UserType;
  onLoginClick: () => void;
  variant?: 'login' | 'register';
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  userType,
  onLoginClick,
  variant,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentEmails, setStudentEmails] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formState, setFormState] = useState<{
    email: string;
    name: string;
    phone?: string;
  }>({
    email: '',
    name: '',
    phone: ''
  });
  const [phoneCountry, setPhoneCountry] = useState<'BR' | 'UK' | 'US' | 'PT'>('BR');
  const { toast } = useToast();
  const navigate = useNavigate();

  const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
    password: z.string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve ter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Senha deve ter pelo menos um caractere especial')
      .refine((password) => {
        const commonWords = ['password', '123456', 'qwerty', 'abc123'];
        return !commonWords.some(word => password.toLowerCase().includes(word));
      }, 'Por favor, crie uma senha mais segura. Tente usar o nome do seu animal de estimação favorito + números + símbolos!'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    phone: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Removed example data initialization
  }, [userType, reset]);

  const handleSignupError = (error: {
    code?: string;
    message: string;
    status?: number;
  }) => {
    console.error('Supabase signup error:', error);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
    
    let errorMessage = 'Erro ao realizar cadastro';
    
    if (error.code === 'user_already_exists' || error.message.includes('User already registered')) {
      errorMessage = 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.';
      
      toast({
        title: "Usuário já cadastrado",
        description: "Redirecionando para a página de login...",
        variant: "default",
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else if (error.message.includes('Database error') || error.code === 'unexpected_failure') {
      // Problema no banco de dados do Supabase - necessita correção no backend
      errorMessage = `Erro no servidor durante o cadastro. Entre em contato com o suporte e informe o código: ${error.code || 'DB-ERROR'}`;
      
      toast({
        title: "Erro interno no servidor",
        description: "Estamos com um problema técnico. Por favor, tente novamente mais tarde ou entre em contato com o suporte.",
        variant: "destructive",
      });
      
      // Solução temporária: armazenar dados para tentativa posterior
      try {
        const tempData = {
          email: formState.email,
          name: formState.name,
          userType,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('pendingRegistration', JSON.stringify(tempData));
        console.log('Saved registration data for later retry:', tempData);
      } catch (err) {
        console.error('Failed to save temp data:', err);
      }
      
    } else if (error.message.includes('Password')) {
      errorMessage = 'A senha não atende aos requisitos mínimos. Deve ter no mínimo 8 caracteres.';
    }
    
    setError(errorMessage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'email' || name === 'password' || name === 'confirmPassword' || name === 'phone') {
      setValue(name, value);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('confirmPassword', e.target.value);
  };

  const handleStudentEmailChange = (index: number, value: string) => {
    const newStudentEmails = [...studentEmails];
    newStudentEmails[index] = value;
    setStudentEmails(newStudentEmails);
  };

  const addStudentEmail = () => {
    setStudentEmails(prev => [...prev, '']);
  };
  
  // Função para alterar o país do telefone
  const handlePhoneCountryChange = (newCountry: 'BR' | 'UK' | 'US' | 'PT') => {
    setPhoneCountry(newCountry);
    
    // Reformatar o número existente para o novo formato
    const currentPhone = watch('phone') || '';
    const reformattedPhone = formatPhoneNumber(currentPhone, newCountry);
    setValue('phone', reformattedPhone);
  };

  // Função de formatação de telefone baseada no país selecionado
  const formatPhoneNumber = (phone: string, country: 'BR' | 'UK' | 'US' | 'PT') => {
    // Remove todos os caracteres não-numéricos, exceto '+'
    const digits = phone.replace(/[^\d+]/g, '');
    
    // Certifique-se de que só há um '+' no início
    let formattedPhone = digits;
    if (formattedPhone.includes('+')) {
      formattedPhone = '+' + formattedPhone.replace(/\+/g, '');
    }
    
    // Aplicar formatação específica por país
    switch (country) {
      case 'BR':
        // Adicionar prefixo +55 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+55' + formattedPhone;
        }
        
        // Formato: +55 (XX) XXXXX-XXXX
        const brDigits = formattedPhone.replace(/\+55/g, '').replace(/\D/g, '');
        if (brDigits.length >= 2) {
          const ddd = brDigits.substring(0, 2);
          const firstPart = brDigits.substring(2, 7);
          const secondPart = brDigits.substring(7, 11);
          
          formattedPhone = `+55 (${ddd})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += `-${secondPart}`;
        }
        break;
        
      case 'UK':
        // Adicionar prefixo +44 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+44' + formattedPhone;
        }
        
        // Formato: +44 (XX) XXXX XXXX
        const ukDigits = formattedPhone.replace(/\+44/g, '').replace(/\D/g, '');
        if (ukDigits.length > 0) {
          // Permitir números completos
          const areaCode = ukDigits.substring(0, 3);
          const firstPart = ukDigits.substring(3, 7);
          const secondPart = ukDigits.substring(7);
          
          formattedPhone = `+44 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += ` ${secondPart}`;
        }
        break;
        
      case 'US':
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+1' + formattedPhone;
        }
        
        const usDigits = formattedPhone.replace(/\+1/g, '').replace(/\D/g, '');
        if (usDigits.length >= 3) {
          const areaCode = usDigits.substring(0, 3);
          const firstPart = usDigits.substring(3, 6);
          const secondPart = usDigits.substring(6);
          
          formattedPhone = `+1 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += `-${secondPart}`;
        }
        break;
        
      case 'PT':
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+351' + formattedPhone;
        }
        
        const ptDigits = formattedPhone.replace(/\+351/g, '').replace(/\D/g, '');
        if (ptDigits.length >= 3) {
          const firstPart = ptDigits.substring(0, 3);
          const secondPart = ptDigits.substring(3, 6);
          const thirdPart = ptDigits.substring(6);
          
          formattedPhone = '+351';
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += ` ${secondPart}`;
          if (thirdPart) formattedPhone += ` ${thirdPart}`;
        }
        break;
    }
    
    return formattedPhone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue, phoneCountry);
    setValue('phone', formattedValue);
  };

  const getCleanPhoneForDatabase = (phone: string) => {
    // Remove todos os caracteres não numéricos, exceto o +
    return phone.replace(/[^\d+]/g, '');
  };

  const onSubmit = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone?: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Erro na confirmação de senha",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    // Validar email
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      toast({
        title: "Email inválido",
        description: emailValidation.error,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Atualizar o estado do formulário para uso no tratamento de erro
    setFormState({ 
      email: data.email,
      name: data.name,
      phone: data.phone
    });

    try {
      console.log('Submitting signup with phone number', data.phone);
      
      // Garantir que o telefone tenha o formato correto para o banco de dados
      const cleanPhone = data.phone ? getCleanPhoneForDatabase(data.phone) : undefined;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(), // Garantir que o email esteja limpo e em minúsculas
        password: data.password,
        options: {
          data: {
            full_name: data.name.trim(),
            user_type: userType,
            phone: cleanPhone,
          }
        }
      });

      if (error) {
        handleSignupError(error);
        setIsLoading(false);
        return;
      }

      if (userType === 'parent' && studentEmails.length > 0) {
        // Validar emails dos estudantes
        for (const studentEmail of studentEmails) {
          const studentEmailValidation = validateEmail(studentEmail);
          if (!studentEmailValidation.isValid) {
            toast({
              title: "Email de estudante inválido",
              description: `${studentEmail}: ${studentEmailValidation.error}`,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
        localStorage.setItem('pendingStudentEmails', JSON.stringify(studentEmails));
      }

      toast({
        title: "Cadastro enviado",
        description: `Cadastro como ${userType === 'student' ? 'estudante' : 'responsável'} realizado com sucesso.`,
        variant: "default",
      });
      
      navigate('/register/confirm', { replace: true });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      handleSignupError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordGuidance = () => {
    return (
      <div className="text-sm text-gray-600 mt-2 space-y-1">
        <p>💡 Dicas para criar uma senha legal e segura:</p>
        <ul className="list-disc pl-5">
          <li>Use o nome do seu animal de estimação favorito</li>
          <li>Adicione números especiais para você (como sua idade)</li>
          <li>Coloque símbolos divertidos (!@#$)</li>
          <li>Exemplo: "Rex2024!@"</li>
        </ul>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-cy="register-form">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm" data-cy="error-message">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Nome Completo</Label>
        <Input
          {...register('name')}
          placeholder="Digite seu nome completo"
          className="w-full"
          data-cy="fullname-input"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          {...register('email')}
          type="email"
          placeholder="seu@email.com"
          className="w-full"
          data-cy="email-input"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Senha</Label>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full"
            data-cy="password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Confirmar Senha</Label>
        <div className="relative">
          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full"
            data-cy="password-confirm-input"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Telefone (Opcional)</Label>
        <Input
          {...register('phone')}
          type="tel"
          placeholder="(XX) XXXXX-XXXX"
          className="w-full"
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        variant="register"
        className="w-full"
        data-cy="submit-button"
      >
        {isLoading ? (
          <>
            <span className="mr-2">Criando conta</span>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onLoginClick}
          className="text-blue-600 hover:text-blue-800 text-sm"
          data-cy="login-link"
        >
          Já tem uma conta? Faça login
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;

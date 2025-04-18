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

interface RegisterFormProps {
  userType: 'student' | 'parent';
  onLoginClick: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  userType,
  onLoginClick,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentEmails, setStudentEmails] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    phone: z.string().min(1, 'Telefone é obrigatório'),
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (userType === 'student') {
      reset({
        name: 'Sarah Rackel Ferreira Lima',
        email: 'franklima.flm@gmail.com',
        password: '4EG8GsjBT5KjD3k',
        confirmPassword: '4EG8GsjBT5KjD3k',
        phone: '+44 7386 797716'
      });
    }
  }, [userType, reset]);

  const handleSignupError = (error: {
    code?: string;
    message: string;
  }) => {
    console.error('Supabase signup error:', {
      message: error.message,
      code: error.code
    });
    
    let errorMessage = 'Erro ao realizar cadastro';
    
    // Handle specific Supabase signup errors
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
    } else if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Credenciais inválidas. Verifique seu email e senha.';
    } else if (error.message.includes('Database error')) {
      errorMessage = 'Erro no banco de dados. Por favor, tente novamente mais tarde.';
    } else if (error.message.includes('Password')) {
      errorMessage = 'A senha não atende aos requisitos mínimos. Deve ter no mínimo 8 caracteres.';
    }
    
    toast({
      title: "Erro no cadastro",
      description: errorMessage,
      variant: "destructive"
    });

    setError(errorMessage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValue(name, value);
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

  const formatPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return `+${digits}`;
    } else if (digits.length <= 6) {
      return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
    } else {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 12)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    setValue('phone', formattedValue);
  };

  const onSubmit = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Erro na confirmação de senha",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: authData, error } = await supabase.client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            user_type: userType,
            phone: data.phone
          }
        }
      });

      if (error) {
        handleSignupError(error);
        setIsLoading(false);
        return;
      }

      if (userType === 'parent' && studentEmails.length > 0) {
        localStorage.setItem('pendingStudentEmails', JSON.stringify(studentEmails));
      }

      toast({
        title: "Cadastro enviado",
        description: `Cadastro como ${userType === 'student' ? 'estudante' : 'responsável'} realizado com sucesso.`,
        variant: "default",
      });
      
      navigate('/register/confirm');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      handleSignupError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={`new${userType === 'student' ? 'Student' : 'Parent'}Name`} className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <Input
          {...register('name')}
          id={`new${userType === 'student' ? 'Student' : 'Parent'}Name`}
          type="text"
          placeholder="Digite seu nome completo"
          required
          autoComplete="name"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`new${userType === 'student' ? 'Student' : 'Parent'}Email`} className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <Input
          {...register('email')}
          id={`new${userType === 'student' ? 'Student' : 'Parent'}Email`}
          type="email"
          placeholder="seu.email@exemplo.com"
          required
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`new${userType === 'student' ? 'Student' : 'Parent'}Password`} className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <div className="relative">
          <Input
            {...register('password')}
            id={`new${userType === 'student' ? 'Student' : 'Parent'}Password`}
            type={showPassword ? "text" : "password"}
            placeholder="Crie uma senha"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`confirm${userType === 'student' ? 'Student' : 'Parent'}Password`} className="block text-sm font-medium text-gray-700">
          Confirmar Senha
        </label>
        <div className="relative">
          <Input
            {...register('confirmPassword')}
            id={`confirm${userType === 'student' ? 'Student' : 'Parent'}Password`}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirme sua senha"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="newParentPhone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <Input
          {...register('phone')}
          id="newParentPhone"
          type="tel"
          placeholder="+44 XXXX XXXXXX"
          required
          autoComplete="tel"
          onChange={handlePhoneChange}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message as string}</p>
        )}
        <p className="text-xs text-gray-500">
          Formato: +44 XXXX XXXXXX
        </p>
      </div>
      
      {userType === 'parent' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Estudantes Vinculados
          </label>
          
          {studentEmails.map((email, index) => (
            <div key={index} className="mb-2">
              <Input
                name={`studentEmail${index}`}
                type="email"
                value={email}
                onChange={(e) => handleStudentEmailChange(index, e.target.value)}
                placeholder="E-mail do estudante"
                autoComplete="off"
              />
            </div>
          ))}
          
          <Button
            type="button"
            onClick={addStudentEmail}
            variant="outline"
            size="sm"
            className="mt-1 flex items-center"
          >
            <Plus size={16} className="mr-1" /> Adicionar outro estudante
          </Button>
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar'
        )}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button 
            type="button" 
            onClick={onLoginClick} 
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Faça login
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;

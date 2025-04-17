
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import supabase from "@/utils/supabase";

interface RegisterFormProps {
  userType: 'student' | 'parent';
  onLoginClick: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  userType,
  onLoginClick,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  useEffect(() => {
    // Pre-fill form with test data when userType is 'student'
    if (userType === 'student') {
      setFormData({
        name: 'Sarah Rackel Ferreira Lima',
        email: 'franklima.flm@gmail.com',
        password: '4EG8GsjBT5KjD3k',
        confirmPassword: '4EG8GsjBT5KjD3k',
        phone: '+44 7386 797716'
      });
    }
  }, [userType]);
  
  const [studentEmails, setStudentEmails] = useState(['']);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      confirmPassword: e.target.value,
    }));
  };

  const handleStudentEmailChange = (index: number, value: string) => {
    const newStudentEmails = [...studentEmails];
    newStudentEmails[index] = value;
    setStudentEmails(newStudentEmails);
  };

  const addStudentEmail = () => {
    setStudentEmails([...studentEmails, '']);
  };

  // Format the phone number (UK format)
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // UK format: +44 XXXX XXXXXX
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
    
    setFormData(prev => ({
      ...prev,
      phone: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro na confirmação de senha",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength (minimum 8 characters)
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(), // Convert email to lowercase
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(), // Trim whitespace
            role: userType,
            phone: formData.phone.trim() // Trim whitespace
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        if (error.message.includes('Database error')) {
          throw new Error('Database error. Please try again later.');
        }
        throw error;
      }

      // If this is a parent, store the student emails for later use
      if (userType === 'parent' && data.user) {
        // Filter out empty emails
        const validStudentEmails = studentEmails.filter(email => email.trim() !== '');
        
        if (validStudentEmails.length > 0) {
          // Save the student emails to link later
          // This could be done via a custom table in your database
          console.log('Student emails to link:', validStudentEmails);
          // Here you would typically save these relationships to your database
        }
      }

      toast({
        title: "Cadastro enviado",
        description: `Cadastro como ${userType === 'student' ? 'estudante' : 'responsável'} realizado com sucesso.`,
      });
      
      // No need to redirect as the UserContext will handle that
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao realizar o cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <div className="space-y-2">
        <label htmlFor={`new${userType === 'student' ? 'Student' : 'Parent'}Name`} className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <Input
          name="name"
          id={`new${userType === 'student' ? 'Student' : 'Parent'}Name`}
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Digite seu nome completo"
          required
          autoComplete="name"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`new${userType === 'student' ? 'Student' : 'Parent'}Email`} className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <Input
          name="email"
          id={`new${userType === 'student' ? 'Student' : 'Parent'}Email`}
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu.email@exemplo.com"
          required
          autoComplete="email"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`new${userType === 'student' ? 'Student' : 'Parent'}Password`} className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <Input
          name="password"
          id={`new${userType === 'student' ? 'Student' : 'Parent'}Password`}
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Crie uma senha"
          required
          autoComplete="new-password"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`confirm${userType === 'student' ? 'Student' : 'Parent'}Password`} className="block text-sm font-medium text-gray-700">
          Confirmar Senha
        </label>
        <Input
          name="confirmPassword"
          id={`confirm${userType === 'student' ? 'Student' : 'Parent'}Password`}
          type="password"
          value={formData.confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Confirme sua senha"
          required
          autoComplete="new-password"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="newParentPhone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <Input
          name="phone"
          id="newParentPhone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="+44 XXXX XXXXXX"
          required
          autoComplete="tel"
        />
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
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
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


import React, { useState } from 'react';
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
import { supabase } from "@/integrations/supabase/client";

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
    phone: '',
    phoneCountry: 'BR', // Default to Brazil
  });
  
  const [studentEmails, setStudentEmails] = useState(['']);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace(`new${userType === 'student' ? 'Student' : 'Parent'}`, '').toLowerCase();
    
    console.log(`Field update - ID: ${id}, Field name: ${fieldName}, Value: ${value}`);
    
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      phoneCountry: value
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

  // Format the phone number based on country
  const formatPhoneNumber = (phone: string, country: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    if (country === 'BR') {
      // Brazilian format: (XX) XXXXX-XXXX
      if (digits.length <= 2) {
        return `(${digits}`;
      } else if (digits.length <= 7) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
      }
    } else if (country === 'UK') {
      // UK format: +44 XXXX XXXXXX
      if (digits.length <= 2) {
        return `+${digits}`;
      } else if (digits.length <= 6) {
        return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
      } else {
        return `+${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 12)}`;
      }
    }
    
    return phone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue, formData.phoneCountry);
    
    setFormData(prevData => ({
      ...prevData,
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
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: userType,
            phone: formData.phone,
            phone_country: formData.phoneCountry
          }
        }
      });

      if (error) throw error;

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`new${userType === 'student' ? 'Student' : 'Parent'}Name`} className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <Input
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
        <label htmlFor="phoneCountry" className="block text-sm font-medium text-gray-700">
          País
        </label>
        <Select
          value={formData.phoneCountry}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger id="phoneCountry" className="w-full">
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BR">Brasil</SelectItem>
            <SelectItem value="UK">Reino Unido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="newParentPhone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <Input
          id="newParentPhone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder={formData.phoneCountry === 'BR' ? "(00) 00000-0000" : "+44 0000 000000"}
          required
          autoComplete="tel"
        />
        <p className="text-xs text-gray-500">
          {formData.phoneCountry === 'BR' 
            ? 'Formato: (XX) XXXXX-XXXX' 
            : 'Formato: +44 XXXX XXXXXX'}
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
                type="email"
                value={email}
                onChange={(e) => handleStudentEmailChange(index, e.target.value)}
                placeholder="E-mail do estudante"
                required
                autoComplete="email"
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

import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    school: '',
    grade: '',
    phone: '',
  });
  
  const [studentEmails, setStudentEmails] = useState(['']);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id.replace(`new${userType === 'student' ? 'Student' : 'Parent'}`, '').toLowerCase()]: value,
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      confirmPassword: e.target.value,
    });
  };

  const handleStudentEmailChange = (index: number, value: string) => {
    const newStudentEmails = [...studentEmails];
    newStudentEmails[index] = value;
    setStudentEmails(newStudentEmails);
  };

  const addStudentEmail = () => {
    setStudentEmails([...studentEmails, '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro na confirmação de senha",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Cadastro enviado",
      description: `Cadastro como ${userType === 'student' ? 'estudante' : 'responsável'} realizado com sucesso.`,
    });

    // For demo purposes only
    console.log('Register:', { userType, ...formData, studentEmails });
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
      
      {userType === 'student' ? (
        <>
          <div className="space-y-2">
            <label htmlFor="studentSchool" className="block text-sm font-medium text-gray-700">
              Escola
            </label>
            <Input
              id="studentSchool"
              type="text"
              value={formData.school}
              onChange={handleChange}
              placeholder="Nome da sua escola"
              required
              autoComplete="organization"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="studentGrade" className="block text-sm font-medium text-gray-700">
              Série/Ano
            </label>
            <Input
              id="studentGrade"
              type="text"
              value={formData.grade}
              onChange={handleChange}
              placeholder="Ex: 9º ano, 2º ano EM"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <Input
              id="parentPhone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
              autoComplete="tel"
            />
          </div>
          
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
        </>
      )}
      
      <Button type="submit" className="w-full">
        Cadastrar
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

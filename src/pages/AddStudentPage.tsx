import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";

// Define tipos adequados sem recursão infinita
interface StudentFormData {
  name: string;
  email: string;
  phone?: string;
  school?: string;
}

interface AddStudentProps {
  onSuccess?: () => void;
}

// Componente de formulário sem recursão infinita de tipos
const AddStudent = ({ onSuccess }: AddStudentProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    school: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Implementação do envio do formulário
      console.log('Form submitted:', formData);
      
      toast({
        title: "Estudante adicionado com sucesso",
        description: "O estudante foi adicionado à sua lista"
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar estudante",
        description: error.message || "Ocorreu um erro ao adicionar o estudante"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Conteúdo do formulário */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Nome completo</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="school" className="block text-sm font-medium mb-1">Escola</label>
          <input
            type="text"
            id="school"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adicionando..." : "Adicionar Estudante"}
      </Button>
    </form>
  );
};

// Página principal que usa o componente AddStudent
const AddStudentPage: React.FC = () => {
  const { user } = useUnifiedAuth();
  const navigate = useNavigate();
  
  // Redirecionar para login se usuário não estiver autenticado
  if (!user) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Adicionar Estudante</CardTitle>
          <CardDescription>Insira os dados do estudante que deseja monitorar.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddStudent onSuccess={() => navigate('/dashboard')} />
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* Footer conteúdo se necessário */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddStudentPage;

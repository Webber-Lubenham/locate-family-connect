import React, { useState, useEffect } from "react";
import { useUser } from '@/contexts/UnifiedAuthContext';
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import ApiErrorBanner from "@/components/ApiErrorBanner";
import { recordApiError } from "@/lib/utils/cache-manager";
import { UserProfile } from "@/types/database";

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<'BR' | 'UK' | 'US' | 'PT'>('BR');

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      setFormData({
        full_name: metadata.full_name || '',
        email: user.email || '',
        phone: metadata.phone || '',
      });
      detectPhoneCountry(metadata.phone || '');
    }
  }, [user]);

  // Função para detectar o país com base no formato do telefone
  const detectPhoneCountry = (phone: string) => {
    if (!phone) return;
    
    if (phone.includes('+55') || phone.includes('(0')) {
      setCountry('BR');
    } else if (phone.includes('+44')) {
      setCountry('UK');
    } else if (phone.includes('+1')) {
      setCountry('US');
    } else if (phone.includes('+351')) {
      setCountry('PT');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = (e.target as HTMLInputElement).value;
    const name = target.name || '';
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        // Extrair partes do número
        const brDigits = formattedPhone.replace(/\+55/g, '').replace(/\D/g, '');
        if (brDigits.length >= 2) {
          const ddd = brDigits.substring(0, 2);
          const firstPart = brDigits.substring(2, 7);
          const secondPart = brDigits.substring(7, 11);
          
          // Construir número formatado
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
        // Extrair partes do número
        const ukDigits = formattedPhone.replace(/\+44/g, '').replace(/\D/g, '');
        if (ukDigits.length >= 2) {
          const areaCode = ukDigits.substring(0, 2);
          const firstPart = ukDigits.substring(2, 6);
          const secondPart = ukDigits.substring(6, 10);
          
          // Construir número formatado
          formattedPhone = `+44 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += ` ${secondPart}`;
        }
        break;
        
      case 'US':
        // Adicionar prefixo +1 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+1' + formattedPhone;
        }
        
        // Formato: +1 (XXX) XXX-XXXX
        // Extrair partes do número
        const usDigits = formattedPhone.replace(/\+1/g, '').replace(/\D/g, '');
        if (usDigits.length >= 3) {
          const areaCode = usDigits.substring(0, 3);
          const firstPart = usDigits.substring(3, 6);
          const secondPart = usDigits.substring(6, 10);
          
          // Construir número formatado
          formattedPhone = `+1 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += `-${secondPart}`;
        }
        break;
        
      case 'PT':
        // Adicionar prefixo +351 se não houver outro prefixo internacional
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+351' + formattedPhone;
        }
        
        // Formato: +351 XXX XXX XXX
        // Extrair partes do número
        const ptDigits = formattedPhone.replace(/\+351/g, '').replace(/\D/g, '');
        if (ptDigits.length >= 3) {
          const firstPart = ptDigits.substring(0, 3);
          const secondPart = ptDigits.substring(3, 6);
          const thirdPart = ptDigits.substring(6, 9);
          
          // Construir número formatado
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
    const formattedValue = formatPhoneNumber(rawValue, country);
    setFormData(prev => ({
      ...prev,
      phone: formattedValue
    }));
  };
  
  // Função para alterar o país e reformatar o telefone
  const handleCountryChange = (newCountry: 'BR' | 'UK' | 'US' | 'PT') => {
    setCountry(newCountry);
    // Reformatar o telefone existente para o novo formato de país
    const reformattedPhone = formatPhoneNumber(formData.phone, newCountry);
    setFormData(prev => ({
      ...prev,
      phone: reformattedPhone
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error("Usuário não encontrado");
      }
      
      // Garantir que o telefone esteja no formato esperado pelo banco
      const cleanPhone = formData.phone.trim();
      
      const updateData = {
        full_name: formData.full_name,
        phone: cleanPhone, // Usar o telefone formatado
        updated_at: new Date().toISOString(),
      };
      console.log("Enviando updateData:", updateData);
      
      const { data: existingProfile, error: checkError } = await supabase.client
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (checkError && !checkError.message?.includes('No rows found')) {
        console.error("Error checking profile:", checkError);
        // Ensure we pass a number to recordApiError
        const errorCode = typeof checkError.code === 'string' 
          ? parseInt(checkError.code) || 500 
          : (typeof checkError.code === 'number' ? checkError.code : 500);
        recordApiError(errorCode, 'profiles-check');
        throw checkError;
      }
      
      if (existingProfile) {
        result = await supabase.client
          .from('profiles')
          .update(updateData)
          .eq('user_id', user.id);
      } else {
        result = await supabase.client
          .from('profiles')
          .insert([{
            ...updateData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            user_type: user.user_metadata?.user_type || 'student' // Add user_type field
          }]);
      }
      
      if (result.error) {
        console.error("Error updating profile:", result.error);
        // Ensure we pass a number to recordApiError
        const errorCode = typeof result.error.code === 'string' 
          ? parseInt(result.error.code) || 500 
          : (typeof result.error.code === 'number' ? result.error.code : 500);
        recordApiError(errorCode, 'profiles-update');
        throw result.error;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atualizar o perfil.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para navegar de volta ao dashboard apropriado
  const goBackToDashboard = () => {
    // Determinar o tipo de usuário para redirecionamento
    const userType = user?.user_metadata?.user_type || 'student';
    if (userType === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Botão de voltar */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goBackToDashboard} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <ApiErrorBanner />

      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seus dados cadastrais</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                placeholder="seu.email@exemplo.com"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="space-y-2">
                <div className="flex gap-2 mb-2">
                  <Button 
                    type="button" 
                    variant={country === 'BR' ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleCountryChange('BR')}
                  >
                    🇧🇷 +55
                  </Button>
                  <Button 
                    type="button" 
                    variant={country === 'UK' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleCountryChange('UK')}
                  >
                    🇬🇧 +44
                  </Button>
                  <Button 
                    type="button" 
                    variant={country === 'US' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleCountryChange('US')}
                  >
                    🇺🇸 +1
                  </Button>
                  <Button 
                    type="button" 
                    variant={country === 'PT' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleCountryChange('PT')}
                  >
                    🇵🇹 +351
                  </Button>
                </div>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder={
                    country === 'BR' ? "+55 (XX) XXXXX-XXXX" :
                    country === 'UK' ? "+44 (XX) XXXX XXXX" :
                    country === 'US' ? "+1 (XXX) XXX-XXXX" :
                    "+351 XXX XXX XXX"
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione o país e digite o número no formato indicado
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;

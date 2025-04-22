
import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import ApiErrorBanner from "@/components/ApiErrorBanner";
import { recordApiError } from "@/lib/utils/cache-manager";

const ProfilePage = () => {
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    phoneCountry: 'BR',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        phoneCountry: profile.phone_country || 'BR',
      });
    } else if (user) {
      const metadata = user.user_metadata || {};
      setFormData({
        full_name: metadata.full_name || '',
        email: user.email || '',
        phone: metadata.phone || '',
        phoneCountry: metadata.phone_country || 'BR',
      });
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = (e.target as HTMLInputElement).value;
    const name = target.name || '';
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phoneCountry: value,
    }));
  };

  const formatPhoneNumber = (phone: string, country: string) => {
    const digits = phone.replace(/\D/g, '');
    
    if (country === 'BR') {
      if (digits.length <= 2) {
        return `(${digits}`;
      } else if (digits.length <= 7) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
      }
    } else if (country === 'UK') {
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
    
    setFormData(prev => ({
      ...prev,
      phone: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error("Usuário não encontrado");
      }
      
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        phone_country: formData.phoneCountry,
        updated_at: new Date().toISOString(),
      };
      
      const { data: existingProfile, error: checkError } = await supabase.client
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (checkError && !checkError.message.includes('No rows found')) {
        console.error("Error checking profile:", checkError);
        // Ensure we pass a number to recordApiError
        recordApiError(typeof checkError.code === 'string' ? parseInt(checkError.code) || 500 : 500, 'profiles-check');
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
            created_at: new Date().toISOString()
          }]);
      }
      
      if (result.error) {
        console.error("Error updating profile:", result.error);
        // Ensure we pass a number to recordApiError
        recordApiError(typeof result.error.code === 'string' ? parseInt(result.error.code) || 500 : 500, 'profiles-update');
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
              <Label htmlFor="phoneCountry">País</Label>
              <Select
                value={formData.phoneCountry}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="phoneCountry">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BR">Brasil</SelectItem>
                  <SelectItem value="UK">Reino Unido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder={formData.phoneCountry === 'BR' ? "(00) 00000-0000" : "+44 0000 000000"}
              />
              <p className="text-xs text-muted-foreground">
                {formData.phoneCountry === 'BR' 
                  ? 'Formato: (XX) XXXXX-XXXX' 
                  : 'Formato: +44 XXXX XXXXXX'}
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

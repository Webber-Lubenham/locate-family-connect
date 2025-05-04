
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw } from 'lucide-react';

interface PhoneCountry {
  code: 'BR' | 'UK' | 'US' | 'PT';
  label: string;
  prefix: string;
  format: string;
}

interface AddGuardianFormProps {
  onSubmit: (email: string, name: string, phone: string) => Promise<void>;
}

const AddGuardianForm: React.FC<AddGuardianFormProps> = ({ onSubmit }) => {
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<'BR' | 'UK' | 'US' | 'PT'>('BR');

  const phoneCountries: PhoneCountry[] = [
    { code: 'BR', label: '🇧🇷 +55', prefix: '+55', format: '+55 (XX) XXXXX-XXXX' },
    { code: 'UK', label: '🇬🇧 +44', prefix: '+44', format: '+44 (XX) XXXX XXXX' },
    { code: 'US', label: '🇺🇸 +1', prefix: '+1', format: '+1 (XXX) XXX-XXXX' },
    { code: 'PT', label: '🇵🇹 +351', prefix: '+351', format: '+351 XXX XXX XXX' },
  ];
  
  // Function for formatting phone numbers based on country
  const formatPhoneNumber = (phone: string, country: 'BR' | 'UK' | 'US' | 'PT') => {
    // Remove all non-numeric characters, except '+'
    const digits = phone.replace(/[^\d+]/g, '');
    
    // Ensure only one '+' at the beginning
    let formattedPhone = digits;
    if (formattedPhone.includes('+')) {
      formattedPhone = '+' + formattedPhone.replace(/\+/g, '');
    }
    
    // Apply country-specific formatting
    const countryInfo = phoneCountries.find(c => c.code === country);
    if (!countryInfo) return formattedPhone;
    
    // Add prefix if not present
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = countryInfo.prefix + formattedPhone;
    }
    
    let nationalDigits = '';
    
    // Extract national digits based on country prefix
    switch (country) {
      case 'BR':
        nationalDigits = formattedPhone.replace(/\+55/g, '').replace(/\D/g, '');
        if (nationalDigits.length >= 2) {
          const ddd = nationalDigits.substring(0, 2);
          const firstPart = nationalDigits.substring(2, 7);
          const secondPart = nationalDigits.substring(7, 11);
          
          formattedPhone = `+55 (${ddd})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += `-${secondPart}`;
        }
        break;
        
      case 'UK':
        nationalDigits = formattedPhone.replace(/\+44/g, '').replace(/\D/g, '');
        if (nationalDigits.length >= 2) {
          const areaCode = nationalDigits.substring(0, 2);
          const firstPart = nationalDigits.substring(2, 6);
          const secondPart = nationalDigits.substring(6, 10);
          
          formattedPhone = `+44 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += ` ${secondPart}`;
        }
        break;
        
      case 'US':
        nationalDigits = formattedPhone.replace(/\+1/g, '').replace(/\D/g, '');
        if (nationalDigits.length >= 3) {
          const areaCode = nationalDigits.substring(0, 3);
          const firstPart = nationalDigits.substring(3, 6);
          const secondPart = nationalDigits.substring(6, 10);
          
          formattedPhone = `+1 (${areaCode})`;
          if (firstPart) formattedPhone += ` ${firstPart}`;
          if (secondPart) formattedPhone += `-${secondPart}`;
        }
        break;
        
      case 'PT':
        nationalDigits = formattedPhone.replace(/\+351/g, '').replace(/\D/g, '');
        if (nationalDigits.length >= 3) {
          const firstPart = nationalDigits.substring(0, 3);
          const secondPart = nationalDigits.substring(3, 6);
          const thirdPart = nationalDigits.substring(6, 9);
          
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
    setNewGuardianPhone(formattedValue);
  };
  
  const handlePhoneCountryChange = (newCountry: 'BR' | 'UK' | 'US' | 'PT') => {
    setPhoneCountry(newCountry);
    // Reformat existing phone number
    const reformattedPhone = formatPhoneNumber(newGuardianPhone, newCountry);
    setNewGuardianPhone(reformattedPhone);
  };

  const handleSubmit = async () => {
    // Validate email
    if (!newGuardianEmail || !newGuardianEmail.includes("@")) {
      setFormError("Email do responsável é obrigatório e deve ser válido");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      
      await onSubmit(
        newGuardianEmail.trim().toLowerCase(),
        newGuardianName.trim(),
        newGuardianPhone.trim()
      );
      
      // Reset form fields
      setNewGuardianEmail("");
      setNewGuardianName("");
      setNewGuardianPhone("");
    } catch (err: any) {
      console.error("Erro no formulário:", err);
      setFormError(err.message || "Erro ao adicionar responsável");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="email">Email do Responsável *</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          value={newGuardianEmail}
          onChange={(e) => setNewGuardianEmail(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Responsável</Label>
        <Input
          id="name"
          placeholder="Nome completo"
          value={newGuardianName}
          onChange={(e) => setNewGuardianName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone do Responsável</Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {phoneCountries.map(country => (
              <Button 
                key={country.code}
                type="button" 
                variant={phoneCountry === country.code ? "default" : "outline"} 
                size="sm" 
                onClick={() => handlePhoneCountryChange(country.code)}
              >
                {country.label}
              </Button>
            ))}
          </div>
          <Input
            id="phone"
            placeholder={
              phoneCountries.find(c => c.code === phoneCountry)?.format || "Telefone"
            }
            value={newGuardianPhone}
            onChange={handlePhoneChange}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Selecione o país e digite o número no formato indicado
        </p>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end gap-2 mt-4">
        <Button
          onClick={handleSubmit} 
          disabled={submitting || !newGuardianEmail}
        >
          {submitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
              Enviando...
            </>
          ) : (
            "Adicionar"
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddGuardianForm;

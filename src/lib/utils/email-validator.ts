// Lista de domínios de email temporário conhecidos
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  '10minutemail.com',
  'throwawaymail.com',
  'yopmail.com',
  'tempmail.net',
  'dispostable.com',
  'sharklasers.com',
  'guerrillamail.net',
  'grr.la',
  'tempmail.ninja',
  'tempmail.io',
  'temp-mail.io',
  'tempmailaddress.com',
  'mailnesia.com',
  'tempr.email',
  'tempmail.dev'
];

// Expressão regular para validação básica de email - sincronizada com o backend
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Função para extrair o domínio de um email
const getDomainFromEmail = (email: string): string => {
  return email.split('@')[1].toLowerCase();
};

// Função para verificar se é um domínio de email temporário
const isDisposableEmail = (email: string): boolean => {
  const domain = getDomainFromEmail(email);
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

// Interface para o resultado da validação
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Função principal de validação de email - sincronizada com o backend
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  // Limpar o email
  email = email.trim().toLowerCase();

  // Validar formato básico
  if (!EMAIL_REGEX.test(email)) {
    return { 
      isValid: false, 
      error: 'Formato de email inválido. Use apenas letras, números e os caracteres . _ % + -' 
    };
  }

  // Verificar comprimento máximo do email (RFC 5321)
  if (email.length > 254) {
    return { 
      isValid: false, 
      error: 'Email muito longo. O limite é de 254 caracteres.' 
    };
  }

  // Verificar parte local do email
  const localPart = email.split('@')[0];
  if (localPart.length > 64) {
    return { 
      isValid: false, 
      error: 'Parte local do email muito longa. O limite é de 64 caracteres.' 
    };
  }

  // Verificar caracteres especiais consecutivos
  if (/[._%+-]{2,}/.test(localPart)) {
    return { 
      isValid: false, 
      error: 'Caracteres especiais consecutivos não são permitidos no email.' 
    };
  }

  // Verificar se começa ou termina com caracteres especiais
  if (/^[._%+-]|[._%+-]$/.test(localPart)) {
    return { 
      isValid: false, 
      error: 'Email não pode começar ou terminar com caracteres especiais.' 
    };
  }

  // Verificar domínios temporários
  if (isDisposableEmail(email)) {
    return { 
      isValid: false, 
      error: 'Emails temporários não são permitidos. Por favor, use um email permanente.' 
    };
  }

  return { isValid: true };
} 
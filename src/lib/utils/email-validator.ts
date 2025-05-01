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

// Expressão regular para validação básica de email
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

// Função principal de validação de email
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  // Limpar o email
  email = email.trim().toLowerCase();

  // Validar formato básico
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // Verificar domínios temporários
  const tempDomains = [
    'tempmail.com',
    'temp-mail.org',
    'disposablemail.com',
    'tempinbox.com',
    'throwawaymail.com'
  ];

  const domain = email.split('@')[1];
  if (tempDomains.includes(domain)) {
    return { isValid: false, error: 'Emails temporários não são permitidos' };
  }

  // Verificar comprimento máximo
  if (email.length > 254) {
    return { isValid: false, error: 'Email muito longo' };
  }

  // Verificar parte local do email
  const localPart = email.split('@')[0];
  if (localPart.length > 64) {
    return { isValid: false, error: 'Parte local do email muito longa' };
  }

  // Verificar caracteres especiais consecutivos
  if (/[._%+-]{2,}/.test(localPart)) {
    return { isValid: false, error: 'Caracteres especiais consecutivos não são permitidos' };
  }

  // Verificar se começa ou termina com caracteres especiais
  if (/^[._%+-]|[._%+-]$/.test(localPart)) {
    return { isValid: false, error: 'Email não pode começar ou terminar com caracteres especiais' };
  }

  return { isValid: true };
} 
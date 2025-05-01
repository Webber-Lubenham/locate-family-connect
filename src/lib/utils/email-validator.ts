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
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  // Verificar se o email está vazio
  if (!email) {
    return { isValid: false, error: 'O email é obrigatório' };
  }

  // Verificar formato básico do email
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // Verificar se é um email temporário
  if (isDisposableEmail(email)) {
    return { isValid: false, error: 'Emails temporários não são permitidos' };
  }

  // Verificar comprimento mínimo e máximo
  if (email.length < 5) {
    return { isValid: false, error: 'Email muito curto' };
  }
  if (email.length > 254) {
    return { isValid: false, error: 'Email muito longo' };
  }

  // Verificar caracteres especiais no nome do usuário
  const [localPart] = email.split('@');
  if (localPart.length > 64) {
    return { isValid: false, error: 'Nome de usuário muito longo' };
  }

  // Verificar se tem caracteres inválidos
  if (/[<>()[\]\\.,;:\s@"]/.test(localPart)) {
    return { isValid: false, error: 'O email contém caracteres inválidos' };
  }

  return { isValid: true };
}; 
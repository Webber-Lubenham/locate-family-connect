export const AUTH_CONFIG = {
  // The main site URL for auth redirects
  SITE_URL: 'https://monitore-mvp.lovable.app',
  
  // List of allowed redirect URLs
  REDIRECT_URLS: [
    'https://monitore-mvp.lovable.app/login',
    'https://monitore-mvp.lovable.app/register',
    'https://monitore-mvp.lovable.app/register/confirm',
    'https://monitore-s1pv.onrender.com'
  ],
  
  // Default redirect path after auth actions
  DEFAULT_REDIRECT: '/login',
  
  // Auth error handling
  ERROR_MESSAGES: {
    'access_denied': 'Acesso negado. Por favor, tente novamente.',
    'otp_expired': 'O link expirou. Por favor, solicite um novo link.',
    'invalid_token': 'Link inválido. Por favor, solicite um novo link.',
    'default': 'Ocorreu um erro. Por favor, tente novamente.'
  }
}; 
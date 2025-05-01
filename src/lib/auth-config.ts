export const AUTH_CONFIG = {
  // The main site URL for auth redirects - use Render.com URL for production
  SITE_URL: 'https://monitore-s1pv.onrender.com',
  
  // List of allowed redirect URLs
  REDIRECT_URLS: [
    'https://monitore-s1pv.onrender.com',
    'https://monitore-s1pv.onrender.com/login',
    'https://monitore-s1pv.onrender.com/register',
    'https://monitore-s1pv.onrender.com/register/confirm',
    'https://monitore-mvp.lovable.app',
    'https://monitore-mvp.lovable.app/login',
    'https://monitore-mvp.lovable.app/register',
    'https://monitore-mvp.lovable.app/register/confirm'
  ],
  
  // Default redirect path after auth actions
  DEFAULT_REDIRECT: '/login',
  
  // Auth error handling
  ERROR_MESSAGES: {
    'access_denied': 'Acesso negado. Por favor, tente novamente.',
    'otp_expired': 'O link expirou. Por favor, solicite um novo link.',
    'invalid_token': 'Link inválido. Por favor, solicite um novo link.',
    'default': 'Ocorreu um erro. Por favor, tente novamente.'
  },

  // Environment-specific configuration
  getRedirectUrl: () => {
    // Check if we're in development
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8080/login';
    }
    // Check if we're on Render.com
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://monitore-s1pv.onrender.com/login';
    }
    // Default to Lovable app
    return 'https://monitore-mvp.lovable.app/login';
  }
}; 
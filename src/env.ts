
/**
 * Configurações centralizadas da aplicação
 * IMPORTANTE: Use este arquivo como única fonte de verdade para configurações
 * Não duplique valores de configuração em outros arquivos
 */

// Chaves API estáveis documentadas
const STABLE_KEYS = {
  // Chave Resend API estável e verificada conforme a documentação em VERSAO_ESTAVEL_COMPARTILHAMENTO_EMAIL.md
  RESEND: 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu',
  
  // MapBox token
  MAPBOX: 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ'
};

// Configurações de domínio estáveis
const STABLE_DOMAINS = {
  // Domínio verificado para envio de emails conforme documentação
  EMAIL_DOMAIN: 'sistema-monitore.com.br',
  
  // Endereço de email remetente verificado
  EMAIL_FROM: 'noreply@sistema-monitore.com.br'
};

export const env = {
  // MAPBOX
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || STABLE_KEYS.MAPBOX,
  MAPBOX_STYLE_URL: import.meta.env.VITE_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
  MAPBOX_CENTER: import.meta.env.VITE_MAPBOX_CENTER || '-23.5489,-46.6388', // São Paulo
  MAPBOX_ZOOM: import.meta.env.VITE_MAPBOX_ZOOM || '12',
  
  // API URLs
  API_URL: import.meta.env.VITE_API_URL || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // RESEND (centralizado para evitar inconsistências)
  RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY || STABLE_KEYS.RESEND,
  
  // Email settings - configurações estáveis documentadas
  EMAIL_FROM: import.meta.env.VITE_EMAIL_FROM || STABLE_DOMAINS.EMAIL_FROM,
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || STABLE_DOMAINS.EMAIL_DOMAIN,
  USE_FALLBACK_SENDER: import.meta.env.VITE_USE_FALLBACK_SENDER || 'true',
  
  // Versões estáveis para referência (usado em diagnósticos)
  STABLE_KEYS,
  STABLE_DOMAINS
};

export default env;

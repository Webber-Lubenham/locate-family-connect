
export const env = {
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ',
  MAPBOX_STYLE_URL: import.meta.env.VITE_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v12',
  MAPBOX_CENTER: import.meta.env.VITE_MAPBOX_CENTER || '-23.5489,-46.6388', // São Paulo
  MAPBOX_ZOOM: import.meta.env.VITE_MAPBOX_ZOOM || '12',
  
  // API URLs
  API_URL: import.meta.env.VITE_API_URL || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY || '',
  
  // Email settings
  EMAIL_FROM: import.meta.env.VITE_EMAIL_FROM || 'noreply@educonnect.app',
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || 'sistema-monitore.com.br',
  USE_FALLBACK_SENDER: import.meta.env.VITE_USE_FALLBACK_SENDER || 'true',
}

export default env;

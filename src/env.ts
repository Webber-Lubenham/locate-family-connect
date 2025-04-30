
export const env = {
  DATABASE_URL: import.meta.env.VITE_DATABASE_URL as string,
  NODE_ENV: import.meta.env.VITE_NODE_ENV as string,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,
  MAPBOX_STYLE_URL: import.meta.env.VITE_MAPBOX_STYLE_URL,
  MAPBOX_CENTER: import.meta.env.VITE_MAPBOX_INITIAL_CENTER,
  MAPBOX_ZOOM: parseInt(import.meta.env.VITE_MAPBOX_INITIAL_ZOOM || '12'),
  RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || 'sistema-monitore.com.br'
} as const;

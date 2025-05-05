-- Migration: Criar tabela de logs de autenticação (auth_logs)
-- Data: 06/05/2025
-- Esta tabela registra eventos de autenticação e operações críticas para auditoria e diagnóstico

CREATE TABLE IF NOT EXISTS public.auth_logs (
  id SERIAL PRIMARY KEY, -- Identificador único do log
  event TEXT NOT NULL,   -- Tipo do evento (ex: migration_applied, login, etc)
  metadata JSONB,        -- Dados adicionais sobre o evento
  created_at TIMESTAMPTZ DEFAULT now() -- Data/hora do registro
);

-- Comentários explicativos
COMMENT ON TABLE public.auth_logs IS 'Tabela de logs de eventos de autenticação e operações críticas.';
COMMENT ON COLUMN public.auth_logs.event IS 'Tipo do evento registrado (ex: migration_applied, login, etc)';
COMMENT ON COLUMN public.auth_logs.metadata IS 'Dados adicionais em formato JSONB sobre o evento';
COMMENT ON COLUMN public.auth_logs.created_at IS 'Data e hora em que o evento foi registrado'; 
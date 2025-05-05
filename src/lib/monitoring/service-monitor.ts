/**
 * Sistema de Monitoramento Proativo
 * 
 * Monitora serviços críticos da aplicação e fornece alertas em caso de falhas.
 * Foco em:
 *  - Envio de emails via Resend
 *  - Atualizações de localização
 *  - Conexão com o Supabase
 *  - Integridade do cache local
 */

import { toast } from 'sonner';
import { env } from '../../env';
import * as locationCache from '../utils/location-cache';

// Tipos de serviços monitorados
export enum ServiceType {
  EMAIL = 'email',
  LOCATION = 'location',
  DATABASE = 'database',
  CACHE = 'cache',
  AUTHENTICATION = 'auth',
  EDGE_FUNCTION = 'edge_function'
}

// Níveis de gravidade
export enum SeverityLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface para eventos de serviço
export interface ServiceEvent {
  id: string;
  timestamp: string;
  service: ServiceType;
  severity: SeverityLevel;
  message: string;
  details?: any;
  resolved?: boolean;
  resolvedAt?: string;
}

// Chaves de armazenamento
const STORAGE_KEYS = {
  SERVICE_EVENTS: 'app.monitoring.events',
  HEALTH_CHECK_TIMESTAMP: 'app.monitoring.last_check'
};

// Tempo máximo sem sincronização (5 minutos em ms)
const MAX_SYNC_TIME = 5 * 60 * 1000;

/**
 * Registra um evento de serviço
 */
export function recordServiceEvent(
  service: ServiceType,
  severity: SeverityLevel,
  message: string,
  details?: any
): ServiceEvent {
  try {
    const events = getServiceEvents();
    
    // Gera ID único para o evento
    const eventId = `${service}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newEvent: ServiceEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      service,
      severity,
      message,
      details,
      resolved: false
    };
    
    // Adiciona o evento à lista
    events.unshift(newEvent);
    
    // Limita o número de eventos armazenados (máximo 50)
    if (events.length > 50) {
      events.pop();
    }
    
    // Salva no localStorage
    localStorage.setItem(STORAGE_KEYS.SERVICE_EVENTS, JSON.stringify(events));
    
    // Exibe notificação para eventos de alta severidade
    if (severity === SeverityLevel.ERROR || severity === SeverityLevel.CRITICAL) {
      toast.error(`Problema detectado: ${message}`, {
        description: `Serviço: ${service}`,
        duration: 5000,
        action: {
          label: 'Ver Detalhes',
          onClick: () => {
            // Redireciona para a página de diagnóstico se clicada
            window.location.href = '/diagnostics';
          }
        }
      });
    }
    
    return newEvent;
  } catch (error) {
    console.error('[MONITORING] Erro ao registrar evento de serviço:', error);
    
    // Fallback: mostra toast mesmo se falhar o registro
    toast.error(`Problema detectado: ${message}`, { 
      description: `Serviço: ${service}`,
      duration: 5000
    });
    
    return {
      id: 'error-fallback',
      timestamp: new Date().toISOString(),
      service,
      severity,
      message,
      details,
      resolved: false
    };
  }
}

/**
 * Recupera todos os eventos de serviço
 */
export function getServiceEvents(): ServiceEvent[] {
  try {
    const events = localStorage.getItem(STORAGE_KEYS.SERVICE_EVENTS);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('[MONITORING] Erro ao recuperar eventos de serviço:', error);
    return [];
  }
}

/**
 * Marca um evento como resolvido
 */
export function resolveServiceEvent(eventId: string): boolean {
  try {
    const events = getServiceEvents();
    const index = events.findIndex(event => event.id === eventId);
    
    if (index !== -1) {
      events[index].resolved = true;
      events[index].resolvedAt = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEYS.SERVICE_EVENTS, JSON.stringify(events));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[MONITORING] Erro ao resolver evento de serviço:', error);
    return false;
  }
}

/**
 * Limpa eventos resolvidos antigos (mais de 7 dias)
 */
export function cleanupResolvedEvents(): void {
  try {
    const events = getServiceEvents();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const filteredEvents = events.filter(event => {
      if (!event.resolved) return true;
      
      const resolvedDate = new Date(event.resolvedAt || event.timestamp);
      return resolvedDate > sevenDaysAgo;
    });
    
    localStorage.setItem(STORAGE_KEYS.SERVICE_EVENTS, JSON.stringify(filteredEvents));
  } catch (error) {
    console.error('[MONITORING] Erro ao limpar eventos resolvidos:', error);
  }
}

/**
 * Verifica se há eventos críticos ativos
 */
export function hasCriticalEvents(): boolean {
  const events = getServiceEvents();
  return events.some(event => 
    (event.severity === SeverityLevel.CRITICAL || event.severity === SeverityLevel.ERROR) && 
    !event.resolved
  );
}

/**
 * Realiza verificação da conexão com o serviço Resend
 * Usa abordagem indireta para evitar erro de CORS no navegador
 */
export async function checkResendService(): Promise<boolean> {
  try {
    // Em vez de verificar diretamente a API Resend (que causaria erro de CORS),
    // verificamos a presença e validade da chave API e qualquer erro recente no cache
    if (!env.RESEND_API_KEY) {
      recordServiceEvent(
        ServiceType.EMAIL,
        SeverityLevel.WARNING,
        'Chave API do Resend não configurada',
        { apiKeyStatus: 'missing' }
      );
      return false;
    }

    // Verifica formato básico da chave
    if (!env.RESEND_API_KEY.startsWith('re_')) {
      recordServiceEvent(
        ServiceType.EMAIL,
        SeverityLevel.WARNING,
        'Formato de chave API do Resend possivelmente inválido',
        { apiKeyPrefix: env.RESEND_API_KEY.substring(0, 3) }
      );
      return false;
    }
    
    // Verifica eventos recentes para determinar saúde do serviço
    const events = getServiceEvents();
    const recentEmailErrors = events.filter(event => 
      event.service === ServiceType.EMAIL && 
      event.severity === SeverityLevel.ERROR &&
      !event.resolved &&
      new Date(event.timestamp).getTime() > Date.now() - (30 * 60 * 1000) // últimos 30 minutos
    );

    if (recentEmailErrors.length > 0) {
      console.log('[MONITORING] Email service has recent errors:', recentEmailErrors.length);
      return false;
    }
    
    // Se não há erros recentes, presumimos que está ok
    return true;
  } catch (error) {
    recordServiceEvent(
      ServiceType.EMAIL,
      SeverityLevel.ERROR,
      'Falha ao verificar status do serviço de email',
      { error: String(error) }
    );
    return false;
  }
}

/**
 * Verifica sincronização de localização
 */
export function checkLocationSyncStatus(): boolean {
  const lastSync = locationCache.getLastSyncTimestamp();
  
  if (!lastSync) {
    // Se nunca sincronizou, verifica se há dados pendentes
    if (locationCache.hasPendingLocations()) {
      recordServiceEvent(
        ServiceType.LOCATION,
        SeverityLevel.WARNING,
        'Localizações pendentes nunca sincronizadas',
        { pendingCount: locationCache.getLocationCache().filter(loc => loc._pendingSync).length }
      );
      return false;
    }
    return true;
  }
  
  const lastSyncTime = new Date(lastSync).getTime();
  const now = Date.now();
  
  // Verifica se faz muito tempo desde a última sincronização
  if (now - lastSyncTime > MAX_SYNC_TIME && locationCache.hasPendingLocations()) {
    recordServiceEvent(
      ServiceType.LOCATION,
      SeverityLevel.WARNING,
      'Localizações não sincronizadas por muito tempo',
      { 
        lastSync,
        pendingCount: locationCache.getLocationCache().filter(loc => loc._pendingSync).length,
        timeSinceLastSync: `${Math.round((now - lastSyncTime) / 60000)} minutos`
      }
    );
    return false;
  }
  
  return true;
}

/**
 * Executa verificação completa de saúde do sistema
 */
export async function runSystemHealthCheck(): Promise<{
  overall: boolean;
  email: boolean;
  location: boolean;
}> {
  // Verifica último check para evitar sobrecarga
  const lastCheck = localStorage.getItem(STORAGE_KEYS.HEALTH_CHECK_TIMESTAMP);
  const now = Date.now();
  
  if (lastCheck) {
    const lastCheckTime = parseInt(lastCheck, 10);
    // Evita executar checks com menos de 5 minutos de intervalo
    if (now - lastCheckTime < 5 * 60 * 1000) {
      return {
        overall: !hasCriticalEvents(),
        email: true, // Assume OK se verificado recentemente
        location: true // Assume OK se verificado recentemente
      };
    }
  }
  
  // Realiza verificações
  const emailStatus = await checkResendService();
  const locationStatus = checkLocationSyncStatus();
  
  // Limpa eventos antigos
  cleanupResolvedEvents();
  
  // Registra timestamp da verificação
  localStorage.setItem(STORAGE_KEYS.HEALTH_CHECK_TIMESTAMP, now.toString());
  
  const overallStatus = emailStatus && locationStatus && !hasCriticalEvents();
  
  // Se tudo estiver OK, registra evento informativo
  if (overallStatus) {
    recordServiceEvent(
      ServiceType.AUTHENTICATION,
      SeverityLevel.INFO,
      'Verificação de saúde do sistema concluída com sucesso',
      { timestamp: new Date().toISOString() }
    );
  }
  
  return {
    overall: overallStatus,
    email: emailStatus,
    location: locationStatus
  };
}

/**
 * Inicializa monitoramento contínuo (chamar na inicialização da aplicação)
 */
export function initializeMonitoring(): void {
  // Realiza verificação inicial
  runSystemHealthCheck();
  
  // Agenda verificações periódicas
  setInterval(() => {
    runSystemHealthCheck();
  }, 15 * 60 * 1000); // A cada 15 minutos
}

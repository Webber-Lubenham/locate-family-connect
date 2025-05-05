/**
 * Sistema de cache para localizações
 * 
 * Permite armazenar e recuperar localizações localmente para:
 * - Reduzir consultas ao banco de dados
 * - Permitir visualização de histórico mesmo offline
 * - Enfileirar envios de localização em caso de falha de rede
 */

import { Location } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Chaves para armazenamento local
const KEYS = {
  LOCATIONS: 'app.locations.cache',
  PENDING_SHARES: 'app.locations.pending_shares',
  LAST_SYNC: 'app.locations.last_sync'
};

// Interfaces para o cache
interface CachedLocation extends Location {
  _localId?: string;
  _pendingSync?: boolean;
}

interface PendingShare {
  id: string;
  guardianEmail: string;
  studentName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  attempts: number;
}

/**
 * Salva uma localização no cache local
 */
export function cacheLocation(location: CachedLocation): void {
  try {
    // Adiciona um ID local se não existir
    if (!location._localId) {
      location._localId = uuidv4();
    }
    
    // Marca como pendente de sincronização
    location._pendingSync = true;
    
    // Obter cache atual
    const cachedLocations = getLocationCache();
    
    // Adiciona nova localização (limite para 200 entradas)
    cachedLocations.unshift(location);
    if (cachedLocations.length > 200) {
      cachedLocations.pop();
    }
    
    // Salva no localStorage
    localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(cachedLocations));
    console.log('[LOCATION CACHE] Localização adicionada ao cache', location);
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao salvar localização no cache:', error);
  }
}

/**
 * Recupera o cache de localizações
 */
export function getLocationCache(): CachedLocation[] {
  try {
    const cache = localStorage.getItem(KEYS.LOCATIONS);
    return cache ? JSON.parse(cache) : [];
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao recuperar cache de localizações:', error);
    return [];
  }
}

/**
 * Verifica se existem localizações pendentes de sincronização
 */
export function hasPendingLocations(): boolean {
  return getLocationCache().some(location => location._pendingSync === true);
}

/**
 * Marca uma localização como sincronizada
 */
export function markLocationSynced(localId: string, serverLocationId?: string): void {
  try {
    const locations = getLocationCache();
    const index = locations.findIndex(loc => loc._localId === localId);
    
    if (index !== -1) {
      // Atualiza com ID do servidor e marca como sincronizado
      if (serverLocationId) {
        locations[index].id = serverLocationId;
      }
      locations[index]._pendingSync = false;
      
      localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(locations));
      console.log(`[LOCATION CACHE] Localização ${localId} marcada como sincronizada`);
    }
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao marcar localização como sincronizada:', error);
  }
}

/**
 * Adiciona um compartilhamento pendente ao cache
 */
export function addPendingShare(guardianEmail: string, studentName: string, latitude: number, longitude: number): string {
  try {
    const pendingShares = getPendingShares();
    const shareId = uuidv4();
    
    const newShare: PendingShare = {
      id: shareId,
      guardianEmail,
      studentName,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    
    pendingShares.push(newShare);
    localStorage.setItem(KEYS.PENDING_SHARES, JSON.stringify(pendingShares));
    console.log('[LOCATION CACHE] Compartilhamento pendente adicionado:', newShare);
    
    return shareId;
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao adicionar compartilhamento pendente:', error);
    return '';
  }
}

/**
 * Obtém todos os compartilhamentos pendentes
 */
export function getPendingShares(): PendingShare[] {
  try {
    const shares = localStorage.getItem(KEYS.PENDING_SHARES);
    return shares ? JSON.parse(shares) : [];
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao recuperar compartilhamentos pendentes:', error);
    return [];
  }
}

/**
 * Remove um compartilhamento pendente após envio bem-sucedido
 */
export function removePendingShare(shareId: string): void {
  try {
    const pendingShares = getPendingShares();
    const updatedShares = pendingShares.filter(share => share.id !== shareId);
    localStorage.setItem(KEYS.PENDING_SHARES, JSON.stringify(updatedShares));
    console.log(`[LOCATION CACHE] Compartilhamento ${shareId} removido do cache`);
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao remover compartilhamento pendente:', error);
  }
}

/**
 * Incrementa o contador de tentativas para um compartilhamento pendente
 */
export function incrementShareAttempt(shareId: string): void {
  try {
    const pendingShares = getPendingShares();
    const shareIndex = pendingShares.findIndex(share => share.id === shareId);
    
    if (shareIndex !== -1) {
      pendingShares[shareIndex].attempts += 1;
      localStorage.setItem(KEYS.PENDING_SHARES, JSON.stringify(pendingShares));
    }
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao incrementar tentativas de compartilhamento:', error);
  }
}

/**
 * Atualiza o timestamp da última sincronização
 */
export function updateLastSyncTimestamp(): void {
  localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
}

/**
 * Obtém o timestamp da última sincronização
 */
export function getLastSyncTimestamp(): string | null {
  return localStorage.getItem(KEYS.LAST_SYNC);
}

/**
 * Limpa o cache de localizações mantendo apenas as não sincronizadas
 */
export function clearLocationCache(keepPending = true): void {
  try {
    if (keepPending) {
      // Mantém apenas as localizações não sincronizadas
      const locations = getLocationCache();
      const pendingLocations = locations.filter(loc => loc._pendingSync === true);
      localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(pendingLocations));
      console.log('[LOCATION CACHE] Cache limpo mantendo localizações pendentes');
    } else {
      // Limpa todo o cache
      localStorage.removeItem(KEYS.LOCATIONS);
      console.log('[LOCATION CACHE] Cache de localizações completamente limpo');
    }
  } catch (error) {
    console.error('[LOCATION CACHE] Erro ao limpar cache:', error);
  }
}

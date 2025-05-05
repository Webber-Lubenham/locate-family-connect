
/**
 * Testes automatizados para a funcionalidade de compartilhamento de localização
 * Foco em garantir que a estabilidade do sistema seja mantida mesmo após mudanças
 */

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Location, CachedLocation } from '../types/location';
import * as locationCache from '../lib/utils/location-cache';

// Mock do localStorage para testes
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  };
})();

// Substitui localStorage pelo mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock da API de compartilhamento
const mockShareLocation = jest.fn().mockImplementation(() => 
  Promise.resolve({ success: true, emailId: 'test-id' })
);

// Mock da função de salvar localização no banco de dados
const mockSaveLocationToDatabase = jest.fn().mockImplementation(() => 
  Promise.resolve({ id: 'db-location-id', created_at: new Date().toISOString() })
);

// Setup do módulo apiService.shareLocation mock
jest.mock('../lib/services/api', () => ({
  shareLocation: (...args: any[]) => mockShareLocation(...args)
}));

// Setup do módulo de database mock
jest.mock('../lib/services/location/LocationService', () => ({
  saveLocation: (...args: any[]) => mockSaveLocationToDatabase(...args)
}));

// Sample data
const sampleLocation: Location = {
  id: 'test-id',
  user_id: 'test-user',
  latitude: -23.5489,
  longitude: -46.6388,
  timestamp: new Date().toISOString(),
  shared_with_guardians: false
};

const sampleGuardian = {
  id: 'guardian-id',
  student_id: 'test-user',
  email: 'test@example.com',
  is_active: true,
  created_at: new Date().toISOString()
};

describe('Sistema de cache de localização', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Deve armazenar e recuperar localização do cache', () => {
    locationCache.cacheLocation(sampleLocation);
    const cached = locationCache.getLocationCache();
    
    expect(cached).toHaveLength(1);
    expect(cached[0].latitude).toBe(sampleLocation.latitude);
    expect(cached[0].longitude).toBe(sampleLocation.longitude);
    expect(cached[0]._pendingSync).toBe(true);
  });

  test('Deve marcar localização como sincronizada', () => {
    locationCache.cacheLocation(sampleLocation);
    const cached = locationCache.getLocationCache();
    const localId = cached[0]._localId as string;
    
    locationCache.markLocationSynced(localId, 'server-id');
    const updated = locationCache.getLocationCache();
    
    expect(updated[0]._pendingSync).toBe(false);
    expect(updated[0].id).toBe('server-id');
  });

  test('Deve gerenciar compartilhamentos pendentes', () => {
    const shareId = locationCache.addPendingShare(
      sampleGuardian.email, 
      'Estudante Teste', 
      sampleLocation.latitude, 
      sampleLocation.longitude
    );
    
    expect(shareId).toBeTruthy();
    
    const pendingShares = locationCache.getPendingShares();
    expect(pendingShares).toHaveLength(1);
    expect(pendingShares[0].guardianEmail).toBe(sampleGuardian.email);
    
    locationCache.removePendingShare(shareId);
    expect(locationCache.getPendingShares()).toHaveLength(0);
  });
});

describe('Processo de compartilhamento de localização', () => {
  // Mock da função getCurrentPosition do navegador
  const mockGeolocation = {
    getCurrentPosition: jest.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: -23.5489,
          longitude: -46.6388,
          accuracy: 10,
        },
      });
    }),
  };
  
  // Substitui navigator.geolocation pelo mock
  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Deve salvar localização localmente quando offline', async () => {
    // Força falha de rede
    mockSaveLocationToDatabase.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    // Simula função de compartilhamento
    const shareLocationWithGuardian = async (guardian: typeof sampleGuardian) => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        
        try {
          // Tenta salvar no banco
          await mockSaveLocationToDatabase({
            latitude,
            longitude,
            shared_with_guardians: true
          });
        } catch (error) {
          // Fallback para cache local em caso de erro
          locationCache.cacheLocation({
            latitude,
            longitude,
            user_id: 'test-user',
            created_at: new Date().toISOString(),
            shared_with_guardians: true,
          });
        }
        
        try {
          // Tenta enviar email
          await mockShareLocation({
            guardianEmail: guardian.email,
            latitude,
            longitude,
            studentName: 'Estudante Teste'
          });
        } catch (error) {
          // Armazena para tentar novamente depois
          locationCache.addPendingShare(
            guardian.email,
            'Estudante Teste',
            latitude,
            longitude
          );
        }
        
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    };
    
    // Executa o teste
    const result = await shareLocationWithGuardian(sampleGuardian);
    expect(result.success).toBe(true);
    
    // Verifica cache
    const locationCache1 = locationCache.getLocationCache();
    expect(locationCache1).toHaveLength(1);
    expect(locationCache1[0]._pendingSync).toBe(true);
    
    // Simula restauração da conexão
    mockSaveLocationToDatabase.mockImplementationOnce(() => 
      Promise.resolve({ id: 'db-location-id', created_at: new Date().toISOString() })
    );
    
    // Função para sincronizar localizações pendentes
    const syncPendingLocations = async () => {
      const pendingLocations = locationCache.getLocationCache().filter(
        loc => loc._pendingSync === true
      );
      
      for (const location of pendingLocations) {
        try {
          const savedLocation = await mockSaveLocationToDatabase({
            latitude: location.latitude,
            longitude: location.longitude,
            shared_with_guardians: location.shared_with_guardians
          });
          
          if (savedLocation && typeof savedLocation === 'object' && 'id' in savedLocation) {
            locationCache.markLocationSynced(location._localId as string, savedLocation.id as string);
          }
        } catch (error) {
          console.error('Erro ao sincronizar localização:', error);
        }
      }
    };
    
    // Tenta sincronizar
    await syncPendingLocations();
    
    // Verifica resultado
    expect(mockSaveLocationToDatabase).toHaveBeenCalledTimes(2);
    const locationCache2 = locationCache.getLocationCache();
    expect(locationCache2[0]._pendingSync).toBe(false);
  });
});

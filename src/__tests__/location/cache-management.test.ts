
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import * as locationCache from '@/lib/utils/location-cache';
import { createLocalStorageMock, sampleLocation, sampleGuardian } from '../utils/location-test-utils';

// Setup localStorage mock
const localStorageMock = createLocalStorageMock();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Location Cache System', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should store and retrieve locations from cache', () => {
    locationCache.cacheLocation(sampleLocation);
    const cached = locationCache.getLocationCache();
    
    expect(cached).toHaveLength(1);
    expect(cached[0].latitude).toBe(sampleLocation.latitude);
    expect(cached[0].longitude).toBe(sampleLocation.longitude);
    expect(cached[0]._pendingSync).toBe(true);
  });

  test('should mark locations as synced', () => {
    locationCache.cacheLocation(sampleLocation);
    const cached = locationCache.getLocationCache();
    const localId = cached[0]._localId as string;
    
    locationCache.markLocationSynced(localId, 'server-id');
    const updated = locationCache.getLocationCache();
    
    expect(updated[0]._pendingSync).toBe(false);
    expect(updated[0].id).toBe('server-id');
  });

  test('should manage pending location shares', () => {
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

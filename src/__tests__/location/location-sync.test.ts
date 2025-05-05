
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import * as locationCache from '@/lib/utils/location-cache';
import { 
  createLocalStorageMock, 
  mockSaveLocationToDatabase
} from '../utils/location-test-utils';

// Setup localStorage mock
const localStorageMock = createLocalStorageMock();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Setup mock for database service
jest.mock('@/lib/services/location/LocationService', () => ({
  saveLocation: (...args: any[]) => mockSaveLocationToDatabase(...args)
}));

describe('Location Synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    // Add a pending location to the cache
    locationCache.cacheLocation({
      latitude: -23.5489,
      longitude: -46.6388,
      user_id: 'test-user',
      created_at: new Date().toISOString(),
      shared_with_guardians: true,
    });
  });

  test('should synchronize pending locations when connection is restored', async () => {
    // Mock successful database save
    mockSaveLocationToDatabase.mockImplementationOnce(() => 
      Promise.resolve({ id: 'db-location-id', created_at: new Date().toISOString() })
    );
    
    // Function to sync pending locations
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
          console.error('Error syncing location:', error);
        }
      }
    };
    
    // Try to synchronize
    await syncPendingLocations();
    
    // Verify result
    expect(mockSaveLocationToDatabase).toHaveBeenCalledTimes(1);
    const locationCache2 = locationCache.getLocationCache();
    expect(locationCache2[0]._pendingSync).toBe(false);
  });
});

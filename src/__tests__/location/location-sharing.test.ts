
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import * as locationCache from '@/lib/utils/location-cache';
import { 
  createLocalStorageMock, 
  sampleLocation, 
  sampleGuardian, 
  mockShareLocation, 
  mockSaveLocationToDatabase,
  mockGeolocation
} from '../utils/location-test-utils';

// Setup localStorage mock
const localStorageMock = createLocalStorageMock();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Setup mock for API service
jest.mock('@/lib/services/api', () => ({
  shareLocation: (...args: any[]) => mockShareLocation(...args)
}));

// Setup mock for database service
jest.mock('@/lib/services/location/LocationService', () => ({
  saveLocation: (...args: any[]) => mockSaveLocationToDatabase(...args)
}));

// Replace navigator.geolocation with our mock
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('Location Sharing Process', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should save location locally when offline', async () => {
    // Force network failure
    mockSaveLocationToDatabase.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    // Simulate share location function
    const shareLocationWithGuardian = async (guardian: typeof sampleGuardian) => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        
        try {
          // Try to save to database
          await mockSaveLocationToDatabase({
            latitude,
            longitude,
            shared_with_guardians: true
          });
        } catch (error) {
          // Fallback to local cache on error
          locationCache.cacheLocation({
            latitude,
            longitude,
            user_id: 'test-user',
            created_at: new Date().toISOString(),
            shared_with_guardians: true,
          });
        }
        
        try {
          // Try to send email
          await mockShareLocation({
            guardianEmail: guardian.email,
            latitude,
            longitude,
            studentName: 'Estudante Teste'
          });
        } catch (error) {
          // Store to try again later
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
    
    // Run the test
    const result = await shareLocationWithGuardian(sampleGuardian);
    expect(result.success).toBe(true);
    
    // Verify cache
    const locationCache1 = locationCache.getLocationCache();
    expect(locationCache1).toHaveLength(1);
    expect(locationCache1[0]._pendingSync).toBe(true);
  });
});

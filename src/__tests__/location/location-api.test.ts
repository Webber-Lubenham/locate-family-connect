
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { apiService } from '@/lib/api/api-service';
import { 
  mockShareLocation, 
  sampleLocation 
} from '../utils/location-test-utils';

// Mock the API service
jest.mock('@/lib/api/api-service', () => ({
  shareLocation: jest.fn().mockImplementation((...args) => mockShareLocation(...args))
}));

describe('Location API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call API to share location', async () => {
    const result = await apiService.shareLocation(
      'test@example.com',
      sampleLocation.latitude,
      sampleLocation.longitude,
      'Test User'
    );
    
    expect(mockShareLocation).toHaveBeenCalledTimes(1);
    expect(mockShareLocation).toHaveBeenCalledWith(
      'test@example.com',
      sampleLocation.latitude,
      sampleLocation.longitude,
      'Test User'
    );
    expect(result).toHaveProperty('success', true);
  });

  test('should handle API errors gracefully', async () => {
    // Override mock to simulate error
    mockShareLocation.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    // Wrap in try/catch to verify error handling
    try {
      await apiService.shareLocation(
        'test@example.com',
        sampleLocation.latitude,
        sampleLocation.longitude,
        'Test User'
      );
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Network error');
    }
    
    expect(mockShareLocation).toHaveBeenCalledTimes(1);
  });
});

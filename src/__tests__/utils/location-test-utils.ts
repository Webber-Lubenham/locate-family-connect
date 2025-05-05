
import { Location, CachedLocation, PendingShare } from '@/types/location';

// Mock of localStorage for tests
export const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  };
};

// Sample test data
export const sampleLocation: Location = {
  id: 'test-id',
  user_id: 'test-user',
  latitude: -23.5489,
  longitude: -46.6388,
  timestamp: new Date().toISOString(),
  shared_with_guardians: false,
  created_at: new Date().toISOString()
};

export const sampleGuardian = {
  id: 'guardian-id',
  student_id: 'test-user',
  email: 'test@example.com',
  is_active: true,
  created_at: new Date().toISOString()
};

// Mock implementations
export const mockShareLocation = jest.fn().mockImplementation(() => 
  Promise.resolve({ success: true, emailId: 'test-id' })
);

export const mockSaveLocationToDatabase = jest.fn().mockImplementation(() => 
  Promise.resolve({ id: 'db-location-id', created_at: new Date().toISOString() })
);

// Mock geolocation
export const mockGeolocation = {
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

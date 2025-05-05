
// Types for location-related functionality
export interface Location {
  id?: string;
  user_id?: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  shared_with_guardians?: boolean;
  address?: string;
}

export interface CachedLocation extends Location {
  _localId?: string;
  _pendingSync?: boolean;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface PendingShare {
  id: string;
  guardianEmail: string;
  studentName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  attempts: number;
}

export interface ShareLocationResult {
  success: boolean;
  message?: string;
  error?: any;
}

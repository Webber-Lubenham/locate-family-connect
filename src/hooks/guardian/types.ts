
// Guardian entity type
export interface Guardian {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at: string;
  is_active?: boolean;
}

// Share Location status types
export type ShareStatus = 'idle' | 'sharing' | 'success' | 'error';

export interface ShareStatusData {
  status: ShareStatus;
  message?: string;
  timestamp?: number;
}

// Use for last sent location cache
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

// Guardian operation responses
export interface GuardianOperationResult {
  success: boolean;
  message?: string;
  data?: Guardian | null;
}

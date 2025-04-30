export interface GuardianData {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  is_active: boolean | null;
  phone: string | null;
  student_id: string | null;
}

// RPC function return types
export interface LocationRPCData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  location_timestamp: string;
  address: string | null;
  student_name: string;
  student_email: string;
}

// Extending existing LocationData type if needed
export interface LocationData {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string | null;
  shared_with_guardians?: boolean;
  user?: {
    full_name: string;
    user_type: string;
  };
}

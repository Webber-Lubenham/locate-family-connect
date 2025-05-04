
// Definições de tipo compartilhadas para o banco de dados

// Tipo para perfil de usuário
export interface UserProfile {
  id: string | number; // Support both string (UUID) and number (ID) formats
  user_id?: string;
  full_name: string;
  phone?: string | null;
  email: string;
  user_type: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Tipo para dados de localização
export interface LocationData {
  id: string;
  user_id: string; // Now only supports UUID string format
  latitude: number;
  longitude: number;
  timestamp: string;
  location_timestamp?: string; // Added to support new RPC function return type
  address?: string | null; 
  shared_with_guardians?: boolean | null;
  student_name?: string; // Add student name field for location data from RPC
  student_email?: string; // Add student email field for location data from RPC
  user?: {
    full_name: string;
    role?: string;
    user_type?: string;
  } | null;
}

// Create a consistent GuardianData interface here
export interface GuardianData {
  id: string;
  student_id: string | null;
  guardian_id: string | null;
  email: string;
  full_name: string;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  relationship_type: string | null;
  status?: 'pending' | 'active' | 'rejected';
}

// Tipo para mapeamento entre perfil e localização
export interface ProfileWithLocation {
  profile_id: number;
  user_id: string;
  email: string;
}

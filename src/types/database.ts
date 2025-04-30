
// Definições de tipo compartilhadas para o banco de dados

// Tipo para perfil de usuário
export interface UserProfile {
  id: string | number; // Support both string (UUID) and number (ID) formats
  user_id?: string;
  full_name: string;
  phone?: string | null;
  email?: string;
  user_type: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Tipo para dados de localização
export interface LocationData {
  id: string;
  user_id: string; // Only supports UUID string format
  latitude: number;
  longitude: number;
  timestamp: string;
  location_timestamp?: string; // Added to support new RPC function return type
  user?: {
    full_name: string;
    role?: string;
    user_type?: string;
  } | null;
}

// Tipo para responsáveis (guardians)
export interface GuardianData {
  id: string;
  student_id: string; // Padronizamos para string para manter consistência com auth.uid()
  email: string;
  full_name: string;
  phone?: string | null;
  is_active: boolean;
  created_at?: string;
}

// Tipo para mapeamento entre perfil e localização
export interface ProfileWithLocation {
  profile_id: number;
  user_id: string;
  email: string;
}

// Definição dos parâmetros para a função get_student_locations
export interface GetStudentLocationsParams {
  p_guardian_email: string;
  p_student_id: string; // UUID no formato string
}

// Definição do resultado da função get_student_locations
export interface StudentLocationResult {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  location_timestamp: string;
}
